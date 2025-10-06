import React from 'react';

const Header = ({ activeView, setActiveView, showPlatformTools, setShowPlatformTools }) => {
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'products', label: 'PRODUCTS' },
    { id: 'feedback', label: 'FEEDBACK' },
    { id: 'contact', label: 'CONTACT' }
  ];

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="hamburger-menu"
            onClick={() => setShowPlatformTools(!showPlatformTools)}
            title="Platform Tools"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          <div className="logo">
            <span className="logo-text">COLLABBOARD</span>
          </div>
        </div>
        
        <nav className="main-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;