import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Maximize, Minimize } from 'lucide-react';
import './VirtualBrowser.css';
const BrowserNavBar = ({ activeTabUrl, onNavigate, onBack, onForward, onRefresh, isFullscreen, onToggleFullscreen }) => {
  const [inputUrl, setInputUrl] = useState('');
  useEffect(() => {
    setInputUrl(activeTabUrl || '');
  }, [activeTabUrl]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onNavigate(inputUrl);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
      e.target.blur(); 
    }
  };
  return (
    <div className="vb-navbar">
      <button className="vb-nav-btn" onClick={onBack} title="Go back">
        <ArrowLeft size={16} />
      </button>
      <button className="vb-nav-btn" onClick={onForward} title="Go forward">
        <ArrowRight size={16} />
      </button>
      <button className="vb-nav-btn" onClick={onRefresh} title="Reload page">
        <RotateCw size={14} />
      </button>
      <form className="vb-url-bar" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0, paddingLeft: '12px', marginRight: '6px' }} onSubmit={handleSubmit}>
        <input
          type="text"
          style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', height: '100%', outline: 'none' }}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search Google or type a URL"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      <button className="vb-nav-btn" onClick={onToggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </button>
    </div>
  );
};
export default BrowserNavBar;
