import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
  return (
    <nav className="dash-navbar">
      {/* Left: Brand */}
      <div className="dash-navbar-left">
        <span className="dash-navbar-brand">
          SETU
        </span>
      </div>

      {/* Right: Actions */}
      <div className="dash-navbar-right">
        {/* Search */}
        <div className="dash-navbar-search">
          <Search size={14} />
          <span>Search…</span>
        </div>

        <div className="dash-navbar-avatar" title="Profile" id="dash-nav-avatar">
          P
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
