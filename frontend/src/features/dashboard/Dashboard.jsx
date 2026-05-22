import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BotMessageSquare } from 'lucide-react';
import DashboardNavbar from './Navbar/DashboardNavbar';
import Sidebar from './Sidebar/Sidebar';
import './Dashboard.css';

/**
 * Dashboard — layout shell for the authenticated area.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │         DashboardNavbar          │
 *   ├──────────┬──────────────────────┤
 *   │ Sidebar  │   <Outlet />         │
 *   └──────────┴──────────────────────┘
 *
 * Active page is driven by React Router nested routes:
 *   /dashboard/home      → HomePage
 *   /dashboard/meetings  → MeetingsPage
 *   /dashboard/notes     → NotesPage     (src/features/Notes/page/)
 *   /dashboard/assistant → AssistantPage (src/features/assistant/page/)
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistantRoute = location.pathname.includes('/dashboard/assistant');

  return (
    <div className="dashboard-root">
      {/* Sticky top navbar */}
      <DashboardNavbar />

      {/* Below navbar: sidebar + routed content */}
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main-content">  
          <Outlet />
        </main>
      </div>

      {/* Floating Assistant Button */}
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
