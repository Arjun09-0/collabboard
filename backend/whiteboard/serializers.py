from rest_framework import serializers
from .models import Board, ChatMessage

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['room_id', 'strokes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'room_id', 'user_name', 'message', 'timestamp']
        read_only_fields = ['id', 'timestamp']