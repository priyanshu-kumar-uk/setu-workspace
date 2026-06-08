import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { authGetme } from '../../auth/hooks/api.hooks';
import api, { setAccessToken } from '../../axiosInstance';
import './ProfileMenu.css';
const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { data: meData } = authGetme();
  const user = meData?.data || {};
  const firstName = user.firstname || user.firstName || '';
  const lastName = user.lastname || user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  const email = user.email || '';
  const username = user.username || user.userName || '';
  const getInitials = (name) => {
    if (!name || name === 'User') return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };
  const initials = getInitials(fullName);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API error:', err);
    }
    setAccessToken(null);
    navigate('/login');
  };
  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button 
        className="dash-navbar-avatar profile-menu-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Profile Menu"
      >
        {initials}
      </button>
      {isOpen && (
        <div className="profile-menu-dropdown fade-scale-in">
          {}
          <div className="pm-identity-section">
            <div className="pm-large-avatar">{initials}</div>
            <div className="pm-identity-details">
              <div className="pm-fullname">{fullName}</div>
              <div className="pm-email">{email}</div>
            </div>
          </div>
          <div className="pm-divider" />
          {}
          <div className="pm-info-section">
            <div className="pm-info-row">
              <span className="pm-info-label">Email</span>
              <span className="pm-info-value">{email}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-info-label">First Name</span>
              <span className="pm-info-value">{firstName}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-info-label">Last Name</span>
              <span className="pm-info-value">{lastName}</span>
            </div>
          </div>
          <div className="pm-divider" />
          {}
          <div className="pm-actions-section">
            <button className="pm-action-btn pm-logout-btn" onClick={handleLogout}>
              <LogOut size={16} className="pm-action-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileMenu;
