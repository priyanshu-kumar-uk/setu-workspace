import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import './DashboardNavbar.css';
const DashboardNavbar = () => {
  return (
    <nav className="dash-navbar">
      {}
      <div className="dash-navbar-left">
        <span className="dash-navbar-brand">
          SETU
        </span>
      </div>
      {}
      <div className="dash-navbar-right">
        <ProfileMenu />
      </div>
    </nav>
  );
};
export default DashboardNavbar;
