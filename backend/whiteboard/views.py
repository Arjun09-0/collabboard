from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Board, ChatMessage, ActiveUser
from .serializers import BoardSerializer, ChatMessageSerializer

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    lookup_field = 'room_id'

    def get_object(self):
        room_id = self.kwargs['room_id']
        board, created = Board.objects.get_or_create(room_id=room_id)
        return board

    @action(detail=True, methods=['post'])
    def clear(self, request, room_id=None):
        board = self.get_object()
        board.clear_board()
        return Response({'message': 'Board cleared'})

    @action(detail=True, methods=['post'])
    def join_user(self, request, room_id=None):
        user_name = request.data.get('user_name', 'Anonymous')
        
        # Update or create user activity
        user, created = ActiveUser.objects.get_or_create(
            room_id=room_id,
            user_name=user_name
        )
        
        # Clean up old users (inactive for more than 30 seconds)
        cutoff_time = timezone.now() - timedelta(seconds=30)
        ActiveUser.objects.filter(
            room_id=room_id, 
            last_seen__lt=cutoff_time
        ).delete()
        
        # Get current active users
        active_users = ActiveUser.objects.filter(room_id=room_id).values_list('user_name', flat=True)
        
        return Response({
            'message': 'User joined',
            'active_users': list(active_users)
        })

    @action(detail=True, methods=['get'])
    def active_users(self, request, room_id=None):
        # Clean up old users first
        cutoff_time = timezone.now() - timedelta(seconds=30)
        ActiveUser.objects.filter(
            room_id=room_id, 
            last_seen__lt=cutoff_time
        ).delete()
        
        # Get current active users
        active_users = ActiveUser.objects.filter(room_id=room_id).values_list('user_name', flat=True)
        
        return Response({
            'active_users': list(active_users)
        })

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            # Return messages from the last 24 hours for the room
            cutoff_time = timezone.now() - timedelta(hours=24)
            return ChatMessage.objects.filter(
                room_id=room_id, 
                timestamp__gte=cutoff_time
            ).order_by('timestamp')
        return ChatMessage.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)