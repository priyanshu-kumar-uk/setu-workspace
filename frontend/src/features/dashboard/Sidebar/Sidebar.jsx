import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Video, FileText, Bot, HelpCircle, LogOut } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',      icon: Home,     path: '/dashboard/home'      },
  { id: 'meetings',  label: 'Meetings',  icon: Video,    path: '/dashboard/meetings'  },
  { id: 'notes',     label: 'Docs',     icon: FileText, path: '/dashboard/notes'     },
  { id: 'assistant', label: 'Assistant', icon: Bot,      path: '/dashboard/assistant' },
];

const Sidebar = () => {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <span className="sidebar-section-label"></span>

      {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
        const isActive = pathname === path || pathname.startsWith(path + '/');
        return (
          <button
            key={id}
            id={`sidebar-btn-${id}`}
            className={`sidebar-nav-btn${isActive ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && <span className="sidebar-active-indicator" />}
            <Icon size={18} className="sidebar-nav-icon" />
            {label}
          </button>
        );
      })}

      <div className="sidebar-divider" />

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" id="sidebar-btn-help">
          <HelpCircle size={17} />
          Help &amp; Support
        </button>
        <button className="sidebar-footer-btn" id="sidebar-btn-logout">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
