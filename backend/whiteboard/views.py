from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Board
from .serializers import BoardSerializer

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