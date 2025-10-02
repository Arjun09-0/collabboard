# Collaborative Whiteboard Application - COLLABBOARD

# 🎨 COLLABBOARD

A modern, real-time collaborative whiteboard application built with React and Django. Create rooms, share with teammates, and draw together in real-time!

![COLLABBOARD](https://img.shields.io/badge/COLLABBOARD-Live%20Collaboration-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Django](https://img.shields.io/badge/Django-5.2.7-092E20)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Room-based System**: Create or join rooms with unique codes
- **Professional Drawing Tools**: Pen, eraser, line, rectangle, circle, and text tools
- **User Presence**: See who's currently connected to your room
- **Persistent Storage**: All drawings are saved to the database

### 🎨 **Drawing Tools**
- **✏️ Pen Tool (P)**: Freehand drawing with adjustable stroke width
- **🧽 Eraser Tool (E)**: Remove strokes and content
- **📏 Line Tool (L)**: Draw straight lines
- **⬜ Rectangle Tool (R)**: Create rectangles
- **⭕ Circle Tool (C)**: Draw perfect circles
- **📝 Text Tool (T)**: Add text annotations

### 🚀 **Modern UI/UX**
- **Glass Morphism Design**: Beautiful modern interface with backdrop blur
- **Gradient Themes**: Professional dark theme with purple/blue gradients
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Keyboard Shortcuts**: Quick tool selection (P/E/L/R/C/T)
- **Real-time Status**: Connection indicators and user count

## 🛠️ Tech Stack

### **Frontend**
- **React 18.2.0** - Modern React with hooks
- **Konva.js** - High-performance 2D canvas rendering
- **CSS3** - Glass morphism and modern animations
- **WebSocket** - Real-time communication

### **Backend**
- **Django 5.2.7** - Robust web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **SQLite** - Database with JSON field for drawings

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 14+**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Arjun09-0/collabboard.git
cd collabboard
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install django djangorestframework channels channels-redis django-cors-headers daphne

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 🎯 How to Use

### **Creating a Room**
1. Click "Start Creating" on the home page
2. Enter your name
3. Click "Create New Room" - you'll get a unique 6-character room code
4. Share the room code with your collaborators

### **Joining a Room**
1. Click "Start Creating" on the home page
2. Enter your name
3. Enter the room code shared by your teammate
4. Click "Join Room"

### **Drawing Together**
- Select tools using the toolbar or keyboard shortcuts
- Adjust colors and stroke width as needed
- See real-time updates from other users
- Use Undo and Clear functions as needed

## 🏗️ Architecture

```
COLLABBOARD/
├── backend/                 # Django Backend
│   ├── whiteboard/         # Main app
│   │   ├── models.py       # Board data model
│   │   ├── consumers.py    # WebSocket consumers
│   │   ├── views.py        # REST API views
│   │   └── serializers.py  # API serializers
│   └── whiteboard_project/ # Django settings
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.js   # Navigation header
│   │   │   ├── Toolbar.js  # Drawing tools
│   │   │   ├── Whiteboard.js # Canvas component
│   │   │   └── RoomJoin.js # Room management
│   │   ├── App.js          # Main application
│   │   └── App.css         # Styling
│   └── public/             # Static assets
└── README.md
```

## 🌐 API Endpoints

### **REST API**
- `GET /api/boards/{room_id}/` - Get board state
- `PATCH /api/boards/{room_id}/` - Update board state
- `POST /api/boards/{room_id}/clear/` - Clear board

### **WebSocket**
- `ws://localhost:8000/ws/whiteboard/{room_id}/` - Real-time communication

## 🔧 Configuration

### **Backend Settings**
- **CORS Origins**: Configure allowed frontend origins
- **Channel Layers**: Redis for production, InMemory for development
- **Database**: SQLite for development, PostgreSQL recommended for production

### **Frontend Environment**
- **API Base URL**: http://localhost:8000
- **WebSocket URL**: ws://localhost:8000

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Django Team** for the robust backend framework
- **Konva.js** for high-performance canvas rendering
- **Modern CSS** techniques for beautiful UI design

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/Arjun09-0/collabboard/wiki)
- **Issues**: [Report Bug](https://github.com/Arjun09-0/collabboard/issues)
- **Discussions**: [Community](https://github.com/Arjun09-0/collabboard/discussions)

---

**Built with ❤️ by [Arjun](https://github.com/Arjun09-0)**

*Collaborate Without Limits* 🚀

## Features

- Real-time collaborative drawing
- Multiple drawing tools (pen, eraser, pan)
- Color selection and stroke width adjustment
- Clear board functionality
- Undo functionality
- WebSocket-based real-time synchronization
- Persistent board state using REST API

## Technologies Used

### Backend
- Django 4.2.7
- Django REST Framework
- Django Channels (WebSocket support)
- Redis (for Channels backend)
- SQLite (database)

### Frontend
- React 18.2.0
- react-konva (for canvas drawing)
- Konva.js (2D canvas library)

## Setup Instructions

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Redis server

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install and start Redis:
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **macOS**: `brew install redis && brew services start redis`
- **Ubuntu/Debian**: `sudo apt-get install redis-server && sudo systemctl start redis-server`

5. Run Django migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Start the Django development server:
```bash
python manage.py runserver
```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Running the Application

1. **Start Redis server** (if not already running)
2. **Start the Django backend**:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python manage.py runserver
   ```
3. **Start the React frontend**:
   ```bash
   cd frontend
   npm start
   ```
4. **Open your browser** to http://localhost:3000

## Testing Collaborative Features

1. Open multiple browser tabs/windows to http://localhost:3000
2. Draw on one tab and see the strokes appear in real-time on other tabs
3. Test different tools (pen, eraser) and colors
4. Use the clear board function to see it sync across all clients
5. Try the undo function to remove the last stroke

## Project Structure

```
backend/
├── whiteboard_project/     # Django project settings
│   ├── __init__.py
│   ├── settings.py        # Main Django settings
│   ├── urls.py           # Main URL configuration
│   ├── asgi.py           # ASGI configuration for WebSockets
│   └── wsgi.py           # WSGI configuration
├── whiteboard/           # Django app
│   ├── __init__.py
│   ├── models.py         # Board model
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── consumers.py      # WebSocket consumers
│   ├── routing.py        # WebSocket URL routing
│   ├── urls.py           # App URL configuration
│   ├── admin.py          # Django admin configuration
│   ├── apps.py           # App configuration
│   └── tests.py          # Unit tests
├── manage.py             # Django management script
└── requirements.txt      # Python dependencies

frontend/
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── components/
│   │   ├── Whiteboard.js # Main whiteboard component
│   │   └── Toolbar.js    # Drawing tools toolbar
│   ├── App.js            # Main React component
│   ├── App.css           # Application styles
│   ├── index.js          # React entry point
│   └── index.css         # Global styles
└── package.json          # Node.js dependencies
```

## API Endpoints

- `GET /api/boards/{room_id}/` - Get board state
- `POST /api/boards/{room_id}/clear/` - Clear board
- `ws://localhost:8000/ws/whiteboard/{room_id}/` - WebSocket connection

## Customization

- Change `roomId` in `App.js` to create different rooms
- Modify colors and tools in `Toolbar.js`
- Adjust canvas size in `Whiteboard.js`
- Add authentication by modifying Django settings and React components

## Troubleshooting

1. **Redis connection error**: Make sure Redis server is running
2. **WebSocket connection fails**: Check Django Channels configuration
3. **CORS errors**: Verify CORS settings in Django settings.py
4. **Drawing doesn't sync**: Check WebSocket connection in browser developer tools

## Future Enhancements

- User authentication and room permissions
- Chat functionality alongside the whiteboard
- More drawing tools (shapes, text, etc.)
- Export/import whiteboard as images
- Mobile device support
- User presence indicators (cursors)
- Version history and advanced undo/redo