import React from 'react';

const PlatformTools = ({ onClose, onToolSelect }) => {
  const tools = [
    { id: 'whiteboard', name: 'Whiteboard', icon: '🎨', color: '#00ff88' },
    { id: 'ide', name: 'IDE', icon: '💻', color: '#0099ff' },
    { id: 'chat', name: 'Chat', icon: '💬', color: '#ff6b9d' },
    { id: 'filemanager', name: 'File Manager', icon: '📁', color: '#ffb347' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', color: '#9b59b6' },
    { id: 'notes', name: 'Notes/Docs', icon: '📝', color: '#e67e22' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: '#95a5a6' }
  ];

  return (
    <div className="platform-tools">
      <div className="platform-tools-header">
        <h3>Platform Tools</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="tools-list">
        {tools.map(tool => (
          <div 
            key={tool.id}
            className="tool-item"
            onClick={() => onToolSelect(tool.name)}
            style={{ '--tool-color': tool.color }}
          >
            <div className="tool-icon">{tool.icon}</div>
            <span className="tool-name">{tool.name}</span>
          </div>
        ))}
      </div>
      
      <div className="user-profile">
        <div className="avatar">
          <div className="avatar-img">👤</div>
          <div className="online-indicator"></div>
        </div>
        <div className="user-info">
          <span className="user-name">John Doe</span>
          <span className="user-status">Online</span>
        </div>
      </div>
    </div>
  );
};

export default PlatformTools;