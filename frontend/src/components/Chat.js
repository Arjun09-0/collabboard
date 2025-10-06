import React, { useState, useEffect, useRef } from 'react';

// Backend URL configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const Chat = ({ isOpen, onClose, roomId, userName, ws }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for chat messages
  useEffect(() => {
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        // Only add messages from other users (not from current user to prevent duplicates)
        if (data.user_name !== userName) {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            user: data.user_name,
            message: data.message,
            timestamp: new Date(data.timestamp)
          }]);
        }
      } else if (data.type === 'user_typing') {
        if (data.user_name !== userName) {
          setTypingUsers(prev => {
            if (!prev.includes(data.user_name)) {
              return [...prev, data.user_name];
            }
            return prev;
          });
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(user => user !== data.user_name));
          }, 3000);
        }
      }
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.addEventListener('message', handleMessage);
      return () => ws.removeEventListener('message', handleMessage);
    }
  }, [ws, userName]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageData = {
      type: 'chat_message',
      user_name: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add message to local state immediately (optimistic update)
    const localMessage = {
      id: Date.now(),
      user: userName,
      message: newMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, localMessage]);

    // Try WebSocket first
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
      console.log('Message sent via WebSocket');
    } else {
      // Fallback to REST API
      console.log('WebSocket not available, sending via REST API');
      sendMessageViaAPI(messageData).catch(error => {
        console.error('Failed to send message via REST API:', error);
        // Remove message from local state if sending failed
        setMessages(prev => prev.filter(msg => msg.id !== localMessage.id));
      });
    }

    setNewMessage('');
    setIsTyping(false);
  };

  const sendMessageViaAPI = async (messageData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          user_name: messageData.user_name,
          message: messageData.message
        })
      });

      if (!response.ok) {
        console.error('Failed to send message via API');
      }
    } catch (error) {
      console.error('Error sending message via API:', error);
    }
  };

  // Fetch messages via API when WebSocket is not available
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/?room_id=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        const fetchedMessages = data.map(msg => ({
          id: msg.id,
          user: msg.user_name,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        }));
        
        // Only update if we have new messages or different count
        setMessages(prev => {
          if (prev.length !== fetchedMessages.length) {
            return fetchedMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Poll for new messages when WebSocket is not available
  useEffect(() => {
    let pollInterval;
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not available, starting message polling');
      fetchMessages(); // Initial fetch
      pollInterval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    } else {
      console.log('WebSocket connected, stopping message polling');
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [ws, roomId]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Only send typing indicators via WebSocket if available
    if (!isTyping && ws && ws.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      ws.send(JSON.stringify({
        type: 'user_typing',
        user_name: userName
      }));
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">
            💬 Room Chat
            <span className="chat-room-id">#{roomId}</span>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message ${msg.user === userName ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <span className="message-user">{msg.user}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))
          )}
          
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="chat-input"
            maxLength={500}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>

        <div className="chat-info">
          Connected as: <strong>{userName}</strong>
        </div>
      </div>
    </div>
  );
};

export default Chat;