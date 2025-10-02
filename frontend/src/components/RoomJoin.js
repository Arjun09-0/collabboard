import React, { useState } from 'react';

const RoomJoin = ({ onJoinRoom, onBack }) => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinMode, setJoinMode] = useState('create'); // 'create' or 'join'

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    let finalRoomId = roomId;
    if (joinMode === 'create') {
      finalRoomId = generateRoomId();
    } else if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    onJoinRoom(finalRoomId, userName.trim());
  };

  return (
    <div className="room-join-container">
      <div className="room-join-card">
        <button className="back-btn-simple" onClick={onBack}>
          ← Back to Home
        </button>
        
        <h2 className="room-join-title">Join Whiteboard Session</h2>
        
        <div className="join-mode-selector">
          <button
            className={`mode-btn ${joinMode === 'create' ? 'active' : ''}`}
            onClick={() => setJoinMode('create')}
          >
            Create New Room
          </button>
          <button
            className={`mode-btn ${joinMode === 'join' ? 'active' : ''}`}
            onClick={() => setJoinMode('join')}
          >
            Join Existing Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-join-form">
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
            />
          </div>

          {joinMode === 'join' && (
            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID (e.g., ABC123)"
                maxLength={6}
                required
              />
            </div>
          )}

          <button type="submit" className="join-btn">
            {joinMode === 'create' ? 'Create & Join Room' : 'Join Room'}
          </button>
        </form>

        <div className="room-info">
          <h3>How it works:</h3>
          <ul>
            <li><strong>Create New Room:</strong> Generate a unique room ID and share it with others</li>
            <li><strong>Join Existing Room:</strong> Enter the room ID shared by someone else</li>
            <li>All participants in the same room can collaborate in real-time</li>
            <li>Room IDs are 6-character codes (e.g., ABC123)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;