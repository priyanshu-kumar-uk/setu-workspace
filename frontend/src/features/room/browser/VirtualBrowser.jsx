import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBrowserSocket } from './useBrowserSocket';
import BrowserTabStrip from './BrowserTabStrip';
import BrowserNavBar from './BrowserNavBar';
import BrowserCanvas from './BrowserCanvas';
import './VirtualBrowser.css';

const VirtualBrowser = ({ roomId, onClose }) => {
  const { socket, isConnected } = useBrowserSocket(roomId);
  
  const containerRef = useRef(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compute active URL
  const activeTabUrl = tabs.find(t => t.id === activeTabId)?.url || '';

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('browser:tabs-state', (state) => {
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
      // Only render frame if it belongs to the currently active tab
      if (tabId === activeTabId) {
        setCurrentFrame(buffer);
      }
    });

    socket.on('browser:error', ({ message }) => {
      setErrorToast(message);
      setTimeout(() => setErrorToast(null), 3000);
    });

    return () => {
      socket.off('browser:tabs-state');
      socket.off('browser:tab-updated');
      socket.off('browser:frame');
      socket.off('browser:error');
    };
  }, [socket, activeTabId]);

  // Actions
  const handleCreateTab = useCallback(() => {
    socket?.emit('browser:create-tab');
  }, [socket]);

  const handleCloseTab = useCallback((tabId) => {
    socket?.emit('browser:close-tab', { tabId });
  }, [socket]);

  const handleSwitchTab = useCallback((tabId) => {
    setActiveTabId(tabId); // Optimistic UI update
    setCurrentFrame(null); // Clear old frame to avoid flicker
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
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="vb-container">
      {/* Tab Strip */}
      <BrowserTabStrip 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onTabSwitch={handleSwitchTab}
        onTabClose={handleCloseTab}
        onTabCreate={handleCreateTab}
      />

      {/* Nav Bar */}
      <BrowserNavBar 
        activeTabUrl={activeTabUrl}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Viewport */}
      {isConnected ? (
        <BrowserCanvas 
          frameBuffer={currentFrame} 
          onInteraction={handleInteraction} 
        />
      ) : (
        <div className="vb-loading">
          <div className="vb-loading-spinner" />
          <span>Connecting to Browser Session...</span>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="vb-error-toast">
          {errorToast}
        </div>
      )}
    </div>
  );
};

export default VirtualBrowser;
