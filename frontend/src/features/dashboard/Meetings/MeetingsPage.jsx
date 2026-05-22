import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Video, UserPlus, Calendar, MoreVertical, Users, Clock, Copy,} from 'lucide-react';
import './MeetingsPage.css';

/* ── Tab Filter ── */
const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
  
/* ── Mock Data ── */
const ALL_MEETINGS = [
  {
    id: 1,
    title: 'Team Standup',
    date: 'Today · 10:00 AM',
    participants: 5,
    duration: '30 min',
    status: 'upcoming',
    iconClass: 'mc-icon-blue',
  },
  {
    id: 2,
    title: 'Product Review',
    date: 'Today · 01:30 PM',
    participants: 8,
    duration: '1 hr',
    status: 'upcoming',
    iconClass: 'mc-icon-green',
  },
  {
    id: 3,
    title: 'Design Sync',
    date: 'Yesterday · 03:00 PM',
    participants: 4,
    duration: '45 min',
    status: 'completed',
    iconClass: 'mc-icon-purple',
  },
  {
    id: 4,
    title: 'Sprint Planning',
    date: 'May 12 · 11:00 AM',
    participants: 10,
    duration: '2 hr',
    status: 'completed',
    iconClass: 'mc-icon-amber',
  },
  {
    id: 5,
    title: 'Client Call — Acme Corp',
    date: 'May 10 · 02:00 PM',
    participants: 3,
    duration: '1 hr',
    status: 'cancelled',
    iconClass: 'mc-icon-blue',
  },
];

/* ── Status Badge ── */
const StatusBadge = ({ status }) => (
  <span className={`mc-status-badge mc-status-${status}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

/* ── Meeting Card ── */
const MeetingCard = ({ meeting }) => (
  <div className="meeting-card" id={`meeting-card-${meeting.id}`}>
    <div className={`meeting-card-icon ${meeting.iconClass}`}>
      <Video size={20} />
    </div>

    <div className="meeting-card-info">
      <div className="meeting-card-title">{meeting.title}</div>
      <div className="meeting-card-meta">
        <Clock size={12} />
        {meeting.date}
        <span className="mc-dot" />
        <Users size={12} />
        {meeting.participants} people
        <span className="mc-dot" />
        {meeting.duration}
      </div>
    </div>

    <div className="meeting-card-actions">
      <StatusBadge status={meeting.status} />
      {meeting.status === 'upcoming' && (
        <button
          className="mc-action-btn"
          title="Copy join link"
          id={`copy-link-${meeting.id}`}
        >
          <Copy size={15} />
        </button>
      )}
      <button
        className="mc-action-btn"
        title="More options"
        id={`more-options-${meeting.id}`}
      >
        <MoreVertical size={15} />
      </button>
    </div>
  </div>
);

/* ── Meetings Page ── */
const MeetingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered =
    activeTab === 'All'
      ? ALL_MEETINGS
      : ALL_MEETINGS.filter(
          (m) => m.status === activeTab.toLowerCase()
        );

  return (
    <div className="meetings-page">
      {/* Header */}
      <div className="meetings-header">
        <h1 className="meetings-page-title">Meetings</h1>
        <div className="meetings-header-actions">
          <button className="meetings-btn-outline" id="meetings-btn-schedule">
            <Calendar size={16} />
            Schedule
          </button>
          <button 
            className="meetings-btn-primary" 
            id="meetings-btn-new"
            onClick={() => navigate('/room')}
          >
            <Video size={16} />
            New Meeting
          </button>
        </div>
      </div>

      {/* Active Meeting Banner */}
      <div className="active-meeting-banner">
        <div className="active-meeting-left">
          <div className="active-badge">
            <span className="active-badge-dot" />
            Live Now
          </div>
          <div className="active-meeting-title">Team Standup</div>
          <div className="active-meeting-meta">Started 5 minutes ago · 4 of 5 joined</div>
        </div>
        <div className="active-meeting-right">
          <button 
            className="active-btn active-btn-join" 
            id="active-meeting-join-btn"
            onClick={() => navigate('/room')}
          >
            Join Now
          </button>
          <button className="active-btn active-btn-end" id="active-meeting-end-btn">
            End
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="meetings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`meetings-tab${activeTab === tab ? ' active' : ''}`}
            id={`meetings-tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Meeting Cards */}
      <div className="meetings-list">
        {filtered.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '3rem',
              color: '#94a3b8',
              gap: '0.5rem',
            }}
          >
            <Users size={40} strokeWidth={1.2} />
            <span>No {activeTab.toLowerCase()} meetings</span>
          </div>
        ) : (
          filtered.map((m) => <MeetingCard key={m.id} meeting={m} />)
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
