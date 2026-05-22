import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, UserPlus, Calendar, ChevronDown } from 'lucide-react';
import './HomePage.css';

/* ── Live Clock ── */
const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="clock-block">
      <div className="clock-time">{timeStr}</div>
      <div className="clock-date">{dateStr}</div>
    </div>
  );
};

/* ── Action Button ── */
const ActionBtn = ({ id, label, icon: Icon, colorClass, hasDropdown, onClick }) => (
  <div className="action-btn-wrapper">
    <button className={`action-btn ${colorClass}`} id={id} onClick={onClick}>
      <div className="action-icon-wrap">
        <Icon size={20} strokeWidth={2} />
      </div>
    </button>
    <span className="action-label">
      {label}
      {hasDropdown && <ChevronDown size={11} strokeWidth={2.5} className="action-chevron" />}
    </span>
  </div>
);

/* ── Home Page ── */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-center">
        <LiveClock />

        <div className="action-row">
          <ActionBtn
            id="qa-new-meeting"
            label="New meeting"
            icon={Video}
            colorClass="btn-orange"
            hasDropdown
            onClick={() => navigate('/room')}
          />
          <ActionBtn
            id="qa-join"
            label="Join"
            icon={UserPlus}
            colorClass="btn-blue"
            onClick={() => navigate('/room')}
          />
          <ActionBtn
            id="qa-schedule"
            label="Schedule"
            icon={Calendar}
            colorClass="btn-blue-dark"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
