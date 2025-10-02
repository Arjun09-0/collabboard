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