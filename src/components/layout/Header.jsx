import React from 'react';
import { Edit3, Users, Bell, Settings } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useSelector } from 'react-redux';

const Header = () => {
  const { isConnected } = useEditor();
  const { posts } = useSelector((state) => state.posts);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <Edit3 className="logo-icon" />
              <h1 className="logo-text">SocialPost</h1>
            </div>
            <div className={`status-badge ${isConnected ? 'status-connected' : 'status-offline'}`}>
              {isConnected ? 'Connected' : 'Online Mode'}
            </div>
          </div>

          <div className="header-right">
            <div className="header-stats">
              <div>
                <Users style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
           
              </div>
              <div>
                <span>{posts.length} posts</span>
              </div>
            </div>

            <div className="header-actions">
              <button className="icon-button">
                <Bell />
                <div className="notification-dot"></div>
              </button>
              
              <button className="icon-button">
                <Settings />
              </button>

              <img
                src="https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=face"
                alt="Profile"
                className="profile-avatar"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;