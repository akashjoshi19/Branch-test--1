import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            📋 Approval Panel
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/request" 
              className={`nav-link ${isActive('/request') ? 'active' : ''}`}
            >
              New Request
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;