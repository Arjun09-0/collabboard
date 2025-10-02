from django.test import TestCase
from .models import Board

class BoardTestCase(TestCase):
    def setUp(self):
        self.board = Board.objects.create(room_id='test_room')
    
    def test_board_creation(self):
        self.assertEqual(self.board.room_id, 'test_room')
        self.assertEqual(self.board.drawing_data, [])
    
    def test_add_stroke(self):
        stroke_data = {'points': [10, 20, 30, 40], 'color': '#000000'}
        self.board.add_stroke(stroke_data)
        self.assertEqual(len(self.board.drawing_data), 1)
        self.assertEqual(self.board.drawing_data[0], stroke_data)
    
    def test_clear_board(self):
        self.board.add_stroke({'points': [10, 20, 30, 40]})
        self.board.clear_board()
        self.assertEqual(self.board.drawing_data, [])