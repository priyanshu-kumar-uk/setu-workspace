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

// AI: existing ephemeral RoomChatPage (mode: "room", no DB writes)
import RoomChatPage from '../assistant/page/RoomChatPage';
// Docs: new draggable/resizable persistent overlay
import RoomDocsOverlay from './RoomDocsOverlay';
// Virtual Browser
import VirtualBrowser from './browser/VirtualBrowser';

import './RoomDashboard.css';

const RoomDashboard = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  // activePanel drives the right side-panel slot: 'none' | 'chat' | 'ai'
  const [activePanel, setActivePanel] = useState('none');
  // Docs overlay is an independent boolean — it floats above the canvas
  // and does NOT affect the side-panel layout at all.
  const [showDocsOverlay, setShowDocsOverlay] = useState(false);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const [showBrowser, setShowBrowser] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  const controlsTimerRef = useRef(null);

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

  useEffect(() => {
    if (activePanel === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activePanel]);

  // Chat / AI → right side-panel
  const handleTogglePanel = (panelType) => {
    setActivePanel(prev => prev === panelType ? 'none' : panelType);
  };

  // Docs → independent floating overlay (doesn't touch activePanel)
  const handleToggleDocs = () => {
    setShowDocsOverlay(prev => !prev);
  };

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

      <div className="rd-stage-area">

        <div className="rd-workspace" style={{ backgroundColor: '#000000' }}>
          {showBrowser && <VirtualBrowser roomId={roomId} onClose={() => setShowBrowser(false)} />}

          <div
            className={`rd-toolbar ${!showControls ? 'rd-toolbar-hidden' : ''}`}
            onMouseEnter={handleToolbarMouseEnter}
            onMouseLeave={handleMouseMove}
          >
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

              <button
                className={`rd-toolbar-btn ${showBrowser ? 'rd-active' : ''}`}
                onClick={() => setShowBrowser(v => !v)}
                title="Web Browser"
              >
                <Globe size={20} />
                <span>Browser</span>
              </button>

              <button
                className={`rd-toolbar-btn ${showDocsOverlay ? 'rd-active' : ''}`}
                onClick={handleToggleDocs}
                title="Workspace Docs"
              >
                <FileText size={20} />
                <span>Docs</span>
              </button>

              <button
                className={`rd-toolbar-btn ${activePanel === 'ai' ? 'rd-active' : ''}`}
                onClick={() => handleTogglePanel('ai')}
                title="AI Companion"
              >
                <Sparkles size={20} />
                <span>AI Companion</span>
              </button>
            </div>

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

        <div className={`rd-side-panel ${activePanel === 'none' ? 'rd-side-panel-enter' : ''}`}>

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

          <div className={`rd-panel-body ${activePanel === 'ai' ? 'rd-panel-body-ai' : ''}`}>

            {activePanel === 'chat' ? (
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
              <RoomChatPage />
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDashboard;
