import React, { useState, useEffect, useRef } from 'react';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import PlatformTools from './components/PlatformTools';
import Header from './components/Header';
import RoomJoin from './components/RoomJoin';
import './App.css';

function App() {
  const [tool, setTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#00ff88');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPlatformTools, setShowPlatformTools] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [userName, setUserName] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const ws = useRef(null);

  // Polling for board updates when WebSocket is not available
  useEffect(() => {
    let pollInterval;
    
    if (joinedRoom && roomId && (!ws.current || ws.current.readyState !== WebSocket.OPEN)) {
      console.log('WebSocket not available, starting polling for board updates');
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/boards/${roomId}/`);
          const data = await response.json();
          
          // Only update if there are different strokes than we currently have
          if (data.strokes && JSON.stringify(data.strokes) !== JSON.stringify(strokes)) {
            console.log('Board state changed, updating from server');
            setStrokes(data.strokes);
          }
        } catch (error) {
          console.error('Error polling for board updates:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [joinedRoom, roomId, strokes]);

  useEffect(() => {
    if (activeView === 'whiteboard' && joinedRoom && roomId) {
      fetchBoardState();
      setupWebSocket();
      
      // Add keyboard shortcuts
      const handleKeyPress = (e) => {
        if (e.target.tagName === 'INPUT') return; // Don't trigger when typing in input
        if (e.key === 'p' || e.key === 'P') setTool('pen');
        if (e.key === 'e' || e.key === 'E') setTool('eraser');
        if (e.key === 'l' || e.key === 'L') setTool('line');
        if (e.key === 'r' || e.key === 'R') setTool('rectangle');
        if (e.key === 'c' || e.key === 'C') setTool('circle');
        if (e.key === 't' || e.key === 'T') setTool('text');
        if (e.ctrlKey && e.key === 'z') undoLastStroke();
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        if (ws.current) {
          ws.current.close();
        }
      };
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [activeView, joinedRoom, roomId]);

  const fetchBoardState = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/boards/${roomId}/`);
      const data = await response.json();
      console.log('Fetched board data:', data);
      setStrokes(data.strokes || []);
    } catch (error) {
      console.error('Error fetching board state:', error);
    }
  };

  const setupWebSocket = () => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/whiteboard/${roomId}/`);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected to room:', roomId);
      // Send user join message when connected
      ws.current.send(JSON.stringify({
        type: 'user_join',
        user_name: userName || 'Anonymous User'
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'draw_stroke') {
        setStrokes(prev => [...prev, data.stroke]);
      } else if (data.type === 'clear_board') {
        setStrokes([]);
      } else if (data.type === 'board_state') {
        // Load existing board state when joining
        setStrokes(data.strokes || []);
      } else if (data.type === 'user_join') {
        // Update connected users list
        setConnectedUsers(data.users_list || []);
      } else if (data.type === 'user_leave') {
        // Update connected users list
        setConnectedUsers(data.users_list || []);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const sendStroke = async (stroke) => {
    console.log('Sending stroke:', stroke);
    
    // Add stroke to local state immediately for responsive UI
    setStrokes(prev => [...prev, stroke]);
    
    // Send via WebSocket if available
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'draw_stroke',
        stroke: stroke
      }));
    } else {
      console.log('WebSocket not connected, sending via REST API');
      // Fallback: save via REST API
      try {
        const currentBoardResponse = await fetch(`http://localhost:8000/api/boards/${roomId}/`);
        const currentBoard = await currentBoardResponse.json();
        
        const updatedStrokes = [...(currentBoard.strokes || []), stroke];
        
        await fetch(`http://localhost:8000/api/boards/${roomId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            strokes: updatedStrokes
          })
        });
        
        console.log('Stroke saved successfully via REST API');
      } catch (error) {
        console.error('Error saving stroke:', error);
        // Remove the stroke from local state if save failed
        setStrokes(prev => prev.slice(0, -1));
      }
    }
  };

  const clearBoard = async () => {
    console.log('Clearing board');
    
    // Clear local state immediately
    setStrokes([]);
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'clear_board'
      }));
    } else {
      console.log('WebSocket not connected, clearing via REST API');
      // Fallback: clear via REST API
      try {
        await fetch(`http://localhost:8000/api/boards/${roomId}/clear/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('Board cleared successfully via REST API');
      } catch (error) {
        console.error('Error clearing board:', error);
      }
    }
  };

  const joinRoom = async (newRoomId, newUserName) => {
    setRoomId(newRoomId);
    setUserName(newUserName);
    setJoinedRoom(true);
    setActiveView('whiteboard');
    
    // Fetch board state immediately when joining
    try {
      const response = await fetch(`http://localhost:8000/api/boards/${newRoomId}/`);
      const data = await response.json();
      console.log('Fetched board data on join:', data);
      setStrokes(data.strokes || []);
    } catch (error) {
      console.error('Error fetching board state on join:', error);
    }
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const undoLastStroke = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const renderContent = () => {
    switch (activeView) {
      case 'whiteboard':
        if (!joinedRoom) {
          return (
            <RoomJoin 
              onJoinRoom={joinRoom}
              onBack={() => setActiveView('home')}
            />
          );
        }
        return (
          <div className="whiteboard-view">
            <Toolbar
              tool={tool}
              setTool={setTool}
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              onClear={clearBoard}
              onUndo={undoLastStroke}
              onBack={() => {
                setActiveView('home');
                setJoinedRoom(false);
                setRoomId('');
                setConnectedUsers([]);
              }}
              roomId={roomId}
              connectedUsers={connectedUsers}
              userName={userName}
              isWebSocketConnected={ws.current && ws.current.readyState === WebSocket.OPEN}
            />
            <div className="whiteboard-container">
              <Whiteboard
                tool={tool}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                strokes={strokes}
                setStrokes={setStrokes}
                onStrokeComplete={sendStroke}
                isDrawing={isDrawing}
                setIsDrawing={setIsDrawing}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="home-view">
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  Collaborate<br />
                  Without Limits
                </h1>
                <p className="hero-subtitle">
                  Experience the future of team collaboration with<br />
                  our real-time whiteboard platform. Draw, design,<br />
                  and innovate together from anywhere in the world.
                </p>
                <div className="hero-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveView('whiteboard')}
                  >
                    Start Creating
                  </button>
                  <button className="btn btn-secondary">
                    Learn More
                  </button>
                </div>
                <div className="collaboration-features">
                  <div className="feature-item">
                    <span className="feature-icon">🔗</span>
                    <span>Share room codes with teammates</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">👥</span>
                    <span>Real-time collaboration</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎨</span>
                    <span>Professional drawing tools</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="collaboration-icons">
                  <div className="icon-item draw">
                    <div className="icon">🎨</div>
                    <span>Draw</span>
                  </div>
                  <div className="icon-item chat">
                    <div className="icon">💬</div>
                    <span>Chat</span>
                  </div>
                  <div className="icon-item collaborate">
                    <div className="icon">🤝</div>
                    <span>Collaborate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      {renderContent()}

      {showPlatformTools && (
        <PlatformTools 
          onClose={() => setShowPlatformTools(false)}
          onToolSelect={(toolName) => {
            if (toolName === 'Whiteboard') {
              setActiveView('whiteboard');
            }
          }}
        />
      )}
    </div>
  );
}

export default App;