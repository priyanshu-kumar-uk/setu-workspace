import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Users,
  ArrowUp,
  Globe,
  FileText
} from 'lucide-react';

// ─── Room-context feature panels ────────────────────────────────────
// AI: existing ephemeral RoomChatPage (mode: "room", no DB writes)
import RoomChatPage from '../assistant/page/RoomChatPage';
// Docs: new draggable/resizable persistent overlay
import RoomDocsOverlay from './RoomDocsOverlay';

import './RoomDashboard.css';

const RoomDashboard = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  // ── UI layout states ─────────────────────────────────────────────
  // activePanel drives the right side-panel slot: 'none' | 'chat' | 'ai'
  const [activePanel, setActivePanel] = useState('none');
  // Docs overlay is an independent boolean — it floats above the canvas
  // and does NOT affect the side-panel layout at all.
  const [showDocsOverlay, setShowDocsOverlay] = useState(false);

  // ── AV states ────────────────────────────────────────────────────
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // ── Room Chat panel state (local, peer messaging) ────────────────
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  const controlsTimerRef = useRef(null);

  // ── Auto-hide toolbar after 3s of inactivity ────────────────────
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (activePanel === 'none') setShowControls(false);
    }, 3000);
  };

  const handleToolbarMouseEnter = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
  };

  useEffect(() => {
    const container = document.getElementById('rd-container-root');
    if (container) container.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();
    return () => {
      if (container) container.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [activePanel]);

  // ── Scroll chat to bottom ────────────────────────────────────────
  useEffect(() => {
    if (activePanel === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activePanel]);

  // ── Panel toggle ─────────────────────────────────────────────────
  // Chat / AI → right side-panel
  const handleTogglePanel = (panelType) => {
    setActivePanel(prev => prev === panelType ? 'none' : panelType);
  };

  // Docs → independent floating overlay (doesn't touch activePanel)
  const handleToggleDocs = () => {
    setShowDocsOverlay(prev => !prev);
  };

  // ── Room chat submission ─────────────────────────────────────────
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'You',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        text: chatInput,
        isSelf: true
      }
    ]);
    setChatInput('');
  };

  // ── Exit room ────────────────────────────────────────────────────
  const handleExitRoom = () => navigate('/dashboard/home');

  return (
    <div className="rd-container" id="rd-container-root">

      {/* ── Docs Overlay (sits above canvas, outside layout flow) ── */}
      <AnimatePresence>
        {showDocsOverlay && (
          <RoomDocsOverlay
            roomId={roomId}
            onClose={() => setShowDocsOverlay(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main Stage ── */}
      <div className="rd-stage-area">

        {/* ── Central Canvas ── */}
        <div className="rd-workspace" style={{ backgroundColor: '#000000' }}>

          {/* Floating Bottom Toolbar */}
          <div
            className={`rd-toolbar ${!showControls ? 'rd-toolbar-hidden' : ''}`}
            onMouseEnter={handleToolbarMouseEnter}
            onMouseLeave={handleMouseMove}
          >
            {/* Left: AV Controls */}
            <div className="rd-toolbar-group">
              <button
                className="rd-toolbar-btn"
                onClick={() => setIsMicMuted(!isMicMuted)}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted
                  ? <MicOff size={20} style={{ color: 'var(--rd-alert-red)' }} />
                  : <Mic size={20} />}
                <span>Audio</span>
              </button>

              <button
                className="rd-toolbar-btn"
                onClick={() => setIsVideoOn(!isVideoOn)}
                title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {isVideoOn
                  ? <Video size={20} />
                  : <VideoOff size={20} style={{ color: 'var(--rd-alert-red)' }} />}
                <span>Video</span>
              </button>
            </div>

            {/* Center: Feature buttons */}
            <div className="rd-toolbar-group">
              <button className="rd-toolbar-btn" title="Participants">
                <Users size={20} />
                <span>Participants</span>
              </button>

              <button
                className={`rd-toolbar-btn ${activePanel === 'chat' ? 'rd-active' : ''}`}
                onClick={() => handleTogglePanel('chat')}
                title="Toggle Room Chat"
              >
                <MessageSquare size={20} />
                <span>Chat</span>
              </button>

              <button className="rd-toolbar-btn" title="Share Screen">
                <ArrowUp size={20} style={{ color: '#22c55e' }} />
                <span>Share</span>
              </button>

              <button className="rd-toolbar-btn" title="Web Browser">
                <Globe size={20} />
                <span>Browser</span>
              </button>

              {/* Docs → toggles floating overlay, independent of side panel */}
              <button
                className={`rd-toolbar-btn ${showDocsOverlay ? 'rd-active' : ''}`}
                onClick={handleToggleDocs}
                title="Workspace Docs"
              >
                <FileText size={20} />
                <span>Docs</span>
              </button>

              {/* AI Companion → right side-panel */}
              <button
                className={`rd-toolbar-btn ${activePanel === 'ai' ? 'rd-active' : ''}`}
                onClick={() => handleTogglePanel('ai')}
                title="AI Companion"
              >
                <Sparkles size={20} />
                <span>AI Companion</span>
              </button>
            </div>

            {/* Right: End button */}
            <div className="rd-toolbar-group">
              <button
                className="rd-toolbar-btn rd-danger"
                onClick={handleExitRoom}
                title="Exit Room"
              >
                <X size={20} />
                <span>End</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Side Panel (Chat | AI) ── */}
        <div className={`rd-side-panel ${activePanel === 'none' ? 'rd-side-panel-enter' : ''}`}>

          {/* Panel Header */}
          <div className="rd-panel-header">
            <span className="rd-panel-title">
              {activePanel === 'chat' ? 'Room Chat' : 'AI Assistant'}
            </span>
            <button
              className="rd-panel-close-btn"
              onClick={() => setActivePanel('none')}
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Panel Body */}
          <div className={`rd-panel-body ${activePanel === 'ai' ? 'rd-panel-body-ai' : ''}`}>

            {activePanel === 'chat' ? (
              /* ── Room Chat ── */
              <>
                <div className="rd-chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="rd-empty-state">
                      <MessageSquare size={32} strokeWidth={1.5} />
                      <span>No messages in chat yet.</span>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className={`rd-chat-bubble ${msg.isSelf ? 'rd-self' : ''}`}>
                        <div className="rd-bubble-meta">{msg.sender} • {msg.time}</div>
                        <div className="rd-bubble-content">{msg.text}</div>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <form className="rd-chat-input-wrapper" onSubmit={handleSendChatMessage}>
                  <input
                    type="text"
                    className="rd-input-field"
                    placeholder="Type message to room..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="rd-send-btn" title="Send Message">
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              /* ── AI Assistant (ephemeral, room-scoped, no DB writes) ── */
              <RoomChatPage />
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDashboard;
