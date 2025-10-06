from django.db import models
import json

class Board(models.Model):
    room_id = models.CharField(max_length=100, unique=True)
    strokes = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Board {self.room_id}"

    def add_stroke(self, stroke_data):
        self.strokes.append(stroke_data)
        self.save()

    def clear_board(self):
        self.strokes = []
        self.save()

class ChatMessage(models.Model):
    room_id = models.CharField(max_length=100)
    user_name = models.CharField(max_length=100)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.user_name} in {self.room_id}: {self.message[:50]}"

class ActiveUser(models.Model):
    room_id = models.CharField(max_length=100)
    user_name = models.CharField(max_length=100)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['room_id', 'user_name']

    def __str__(self):
        return f"{self.user_name} in {self.room_id}"