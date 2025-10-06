import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Board

class WhiteboardConsumer(AsyncWebsocketConsumer):
    room_users = {}  # Class variable to track users in rooms
    
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'whiteboard_{self.room_id}'
        self.user_name = None

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from room users tracking
        if self.room_id in self.room_users and self.user_name:
            if self.user_name in self.room_users[self.room_id]:
                self.room_users[self.room_id].remove(self.user_name)
                
                # Notify others that user left
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_leave',
                        'user_name': self.user_name,
                        'users_list': list(self.room_users[self.room_id])
                    }
                )
                
                # Clean up empty room
                if not self.room_users[self.room_id]:
                    del self.room_users[self.room_id]

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'user_join':
            # Handle user joining
            self.user_name = data.get('user_name', 'Anonymous')
            
            # Initialize room users list if not exists
            if self.room_id not in self.room_users:
                self.room_users[self.room_id] = set()
            
            # Add user to room
            self.room_users[self.room_id].add(self.user_name)
            
            # Send current board state to the new user
            board = await self.get_board()
            if board and board.strokes:
                await self.send(text_data=json.dumps({
                    'type': 'board_state',
                    'strokes': board.strokes
                }))
            
            # Notify all users about the new user and updated user list
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_join_broadcast',
                    'user_name': self.user_name,
                    'users_list': list(self.room_users[self.room_id])
                }
            )

        elif message_type == 'draw_stroke':
            stroke_data = data['stroke']
            # Save to database
            await self.save_stroke(stroke_data)
            
            # Broadcast to room group (exclude sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'draw_stroke',
                    'stroke': stroke_data,
                    'sender_channel': self.channel_name
                }
            )
        elif message_type == 'clear_board':
            await self.clear_board_db()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'clear_board',
                    'sender_channel': self.channel_name
                }
            )
        elif message_type == 'chat_message':
            # Handle chat messages
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data['message'],
                    'user_name': data['user_name'],
                    'timestamp': data['timestamp']
                }
            )
        elif message_type == 'typing' or message_type == 'user_typing':
            # Handle typing indicators
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_name': data['user_name'],
                    'is_typing': data.get('is_typing', True),
                    'sender_channel': self.channel_name
                }
            )

    async def draw_stroke(self, event):
        stroke = event['stroke']
        sender_channel = event.get('sender_channel')
        
        # Don't send back to the sender
        if sender_channel != self.channel_name:
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'type': 'draw_stroke',
                'stroke': stroke
            }))

    async def clear_board(self, event=None):
        sender_channel = event.get('sender_channel') if event else None
        
        # Don't send back to the sender
        if not event or sender_channel != self.channel_name:
            # Send clear message to WebSocket
            await self.send(text_data=json.dumps({
                'type': 'clear_board'
            }))

    async def user_join_broadcast(self, event):
        # Send user join notification to all clients
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_name': event['user_name'],
            'users_list': event['users_list']
        }))

    async def user_leave(self, event):
        # Send user leave notification to all clients
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_name': event['user_name'],
            'users_list': event['users_list']
        }))

    async def chat_message(self, event):
        # Send chat message to all clients
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user_name': event['user_name'],
            'timestamp': event['timestamp']
        }))

    async def typing_indicator(self, event):
        sender_channel = event.get('sender_channel')
        
        # Don't send back to the sender
        if sender_channel != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'user_typing',
                'user_name': event['user_name'],
                'is_typing': event.get('is_typing', True)
            }))

    @database_sync_to_async
    def get_board(self):
        try:
            board, created = Board.objects.get_or_create(room_id=self.room_id)
            return board
        except Exception:
            return None

    @database_sync_to_async
    def save_stroke(self, stroke_data):
        board, created = Board.objects.get_or_create(room_id=self.room_id)
        board.add_stroke(stroke_data)

    @database_sync_to_async
    def clear_board_db(self):
        board, created = Board.objects.get_or_create(room_id=self.room_id)
        board.clear_board()