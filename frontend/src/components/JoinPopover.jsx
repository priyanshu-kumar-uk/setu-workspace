import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import './JoinPopover.css';
const JoinPopover = ({ onClose, onJoin }) => {
  const [link, setLink] = useState('');
  const handleJoin = () => {
    let id = link.trim();
    if (id.includes(window.location.origin + '/room/')) {
      id = id.split(window.location.origin + '/room/')[1];
    } else if (id.includes('meet.google.com/')) {
      id = id.split('meet.google.com/')[1];
    }
    if (id) onJoin(id);
  };
  return (
    <div className="join-popover-overlay" onClick={onClose}>
      <div className="join-popover" onClick={e => e.stopPropagation()}>
        <div className="join-input-wrapper">
          <Keyboard size={20} className="join-kbd-icon" />
          <input
            type="text"
            className="join-input"
            placeholder="Enter a code or link"
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            autoFocus
          />
          <button 
            className={`join-submit-btn ${link.trim() ? 'active' : ''}`}
            onClick={handleJoin}
            disabled={!link.trim()}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
export default JoinPopover;
