import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBrowserSocket } from './useBrowserSocket';
import BrowserTabStrip from './BrowserTabStrip';
import BrowserNavBar from './BrowserNavBar';
import BrowserCanvas from './BrowserCanvas';
import BrowserSkeleton from '../../../components/ui/Skeletons/BrowserSkeleton';
import './VirtualBrowser.css';
const VirtualBrowser = ({ roomId, onClose, isFullscreen, onToggleFullscreen }) => {
  const { socket, isConnected } = useBrowserSocket(roomId);
  const containerRef = useRef(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('provisioning'); 
  const activeTabUrl = tabs.find(t => t.id === activeTabId)?.url || '';
  useEffect(() => {
    if (!socket) return;
    socket.on('browser:tabs-state', (state) => {
      setSessionStatus('ready');
      setTabs(state.tabs || []);
      if (state.activeTabId) setActiveTabId(state.activeTabId);
    });
    socket.on('browser:tab-updated', (update) => {
      setTabs(prev => prev.map(tab => 
        tab.id === update.tabId 
          ? { ...tab, url: update.url, title: update.title } 
          : tab
      ));
    });
    socket.on('browser:frame', ({ buffer, tabId }) => {
      if (tabId === activeTabId) {
        setCurrentFrame(buffer);
      }
    });
    socket.on('browser:error', ({ message }) => {
      if (message === 'Failed to start browser session' || message === 'No session for room') {
        setSessionStatus('error');
      } else {
        setErrorToast(message);
        setTimeout(() => setErrorToast(null), 3000);
      }
    });
    return () => {
      socket.off('browser:tabs-state');
      socket.off('browser:tab-updated');
      socket.off('browser:frame');
      socket.off('browser:error');
    };
  }, [socket, activeTabId]);
  const handleCreateTab = useCallback(() => {
    socket?.emit('browser:create-tab');
  }, [socket]);
  const handleCloseTab = useCallback((tabId) => {
    socket?.emit('browser:close-tab', { tabId });
  }, [socket]);
  const handleSwitchTab = useCallback((tabId) => {
    setActiveTabId(tabId); 
    setCurrentFrame(null); 
    socket?.emit('browser:switch-tab', { tabId });
  }, [socket]);
  const handleNavigate = useCallback((url) => {
    if (!activeTabId) return;
    socket?.emit('browser:navigate', { tabId: activeTabId, url });
  }, [socket, activeTabId]);
  const handleBack = useCallback(() => {
    if (activeTabId) socket?.emit('browser:back', { tabId: activeTabId });
  }, [socket, activeTabId]);
  const handleForward = useCallback(() => {
    if (activeTabId) socket?.emit('browser:forward', { tabId: activeTabId });
  }, [socket, activeTabId]);
  const handleRefresh = useCallback(() => {
    if (activeTabId) socket?.emit('browser:refresh', { tabId: activeTabId });
  }, [socket, activeTabId]);
  const handleInteraction = useCallback((action) => {
    if (activeTabId) {
      socket?.emit('browser:interact', { tabId: activeTabId, action });
    }
  }, [socket, activeTabId]);
  const handleToggleFullscreen = useCallback(() => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  }, [onToggleFullscreen]);
  const handleRetry = useCallback(() => {
    setSessionStatus('provisioning');
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);
  return (
    <div ref={containerRef} className="vb-container">
      {sessionStatus === 'provisioning' && (
        <div className="vb-provisioning-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', backgroundColor: '#0a0a0c', flex: 1 }}>
          <div className="spinner" style={{ marginBottom: '16px', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Provisioning secure browser environment...</p>
        </div>
      )}
      {sessionStatus === 'error' && (
        <div className="vb-error-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', backgroundColor: '#0a0a0c', flex: 1 }}>
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p style={{ marginBottom: '24px' }}>Failed to start browser session.</p>
          <button onClick={handleRetry} style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Retry Connection</button>
        </div>
      )}
      {sessionStatus === 'ready' && (
        <>
          <BrowserTabStrip 
            tabs={tabs} 
            activeTabId={activeTabId} 
            onTabSwitch={handleSwitchTab}
            onTabClose={handleCloseTab}
            onTabCreate={handleCreateTab}
          />
          <BrowserNavBar 
            activeTabUrl={activeTabUrl}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onForward={handleForward}
            onRefresh={handleRefresh}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
          {isConnected ? (
            <BrowserCanvas 
              frameBuffer={currentFrame} 
              onInteraction={handleInteraction} 
            />
          ) : (
            <BrowserSkeleton />
          )}
        </>
      )}
      {}
      {errorToast && (
        <div className="vb-error-toast">
          {errorToast}
        </div>
      )}
    </div>
  );
};
export default VirtualBrowser;
