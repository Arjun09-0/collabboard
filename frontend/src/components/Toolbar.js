import React from 'react';

const Toolbar = ({
  tool,
  setTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  onUndo,
  onBack,
  roomId,
  connectedUsers = [],
  userName,
  isWebSocketConnected = false,
  onChatToggle,
  isChatOpen = false
}) => {
  const tools = [
    { id: 'pen', label: 'Pen', icon: '✏️', shortcut: 'P' },
    { id: 'eraser', label: 'Eraser', icon: '🧽', shortcut: 'E' },
    { id: 'line', label: 'Line', icon: '📏', shortcut: 'L' },
    { id: 'rectangle', label: 'Rectangle', icon: '⬜', shortcut: 'R' },
    { id: 'circle', label: 'Circle', icon: '⭕', shortcut: 'C' },
    { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' }
  ];

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', 
    '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff6b9d', '#00ff88', '#0099ff', '#ffb347'
  ];

  const widths = [1, 2, 4, 6, 8, 12, 16, 20];

  return (
    <div className="whiteboard-toolbar">
      <div className="toolbar-section">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        
        {roomId && (
          <div className="room-status">
            <div className="room-id-badge">
              Room: <span className="room-code">{roomId}</span>
            </div>
            <div className="users-count">
              👥 {connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''}
            </div>
            <div className={`connection-status ${isWebSocketConnected ? 'connected' : 'disconnected'}`}>
              {isWebSocketConnected ? '🟢 Live' : '🔄 Syncing'}
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <label className="section-label">Tools</label>
        <div className="tool-group">
          {tools.map(t => (
            <button
              key={t.id}
              className={`tool-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => setTool(t.id)}
              title={`${t.label} (Press ${t.shortcut})`}
            >
              <span className="tool-icon">{t.icon}</span>
              <span className="tool-label">{t.label}</span>
              <span className="tool-shortcut">{t.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <label className="section-label">Colors</label>
        <div className="color-section">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="color-picker"
          />
          <div className="color-palette">
            {colors.map(color => (
              <button
                key={color}
                className={`color-btn ${strokeColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar-section">
        <label className="section-label">Stroke Width</label>
        <div className="width-section">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="width-slider"
          />
          <span className="width-value">{strokeWidth}px</span>
        </div>
        
        {roomId && onChatToggle && (
          <div className="chat-section">
            <button 
              className={`chat-toggle-btn ${isChatOpen ? 'active' : ''}`}
              onClick={onChatToggle}
              title="Toggle Chat"
            >
              💬 Chat
            </button>
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <label className="section-label">Actions</label>
        <div className="action-group">
          <button onClick={onUndo} className="action-btn undo-btn">
            ↶ Undo
          </button>
          <button onClick={onClear} className="action-btn clear-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>

      {connectedUsers.length > 0 && (
        <div className="toolbar-section">
          <label className="section-label">Connected Users</label>
          <div className="connected-users">
            <div className="users-list">
              {connectedUsers.map((user, index) => (
                <span key={index} className={`user-badge ${user === userName ? 'current-user' : ''}`}>
                  {user === userName ? `${user} (you)` : user}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;