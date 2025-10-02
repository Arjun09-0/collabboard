from rest_framework import serializers
from .models import Board

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['room_id', 'strokes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']