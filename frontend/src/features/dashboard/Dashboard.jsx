import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BotMessageSquare } from 'lucide-react';
import DashboardNavbar from './Navbar/DashboardNavbar';
import Sidebar from './Sidebar/Sidebar';
import './Dashboard.css';
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistantRoute = location.pathname.includes('/dashboard/assistant');
  return (
    <div className="dashboard-root">
      {}
      <DashboardNavbar />
      {}
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main-content">  
          <Outlet />
        </main>
      </div>
      {}
      {!isAssistantRoute && (
        <button 
          className="floating-assistant-btn" 
          onClick={() => navigate('/dashboard/assistant')}
          title="Open AI Assistant"
        >
          <BotMessageSquare size={28} />
        </button>
      )}
    </div>
  );
};
export default Dashboard;
