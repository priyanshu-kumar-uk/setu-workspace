import React from 'react';
import { X, Plus, Globe } from 'lucide-react';
import './VirtualBrowser.css';

const BrowserTabStrip = ({ tabs, activeTabId, onTabSwitch, onTabClose, onTabCreate }) => {
  return (
    <div className="vb-tab-strip">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        
        // Very basic favicon logic: if it's a domain, grab from google s2
        // In a real app we'd parse the URL properly.
        let faviconUrl = null;
        if (tab.url && tab.url.startsWith('http')) {
          try {
            const urlObj = new URL(tab.url);
            faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
          } catch (e) {
            // Ignore parse errors
          }
        }

        return (
          <div
            key={tab.id}
            className={`vb-tab ${isActive ? 'vb-tab-active' : ''}`}
            onClick={() => !isActive && onTabSwitch(tab.id)}
            title={tab.title || tab.url || 'New Tab'}
          >
            <div className="vb-tab-favicon">
              {faviconUrl ? (
                <img src={faviconUrl} alt="favicon" />
              ) : (
                <Globe size={10} />
              )}
            </div>
            
            <div className="vb-tab-title">
              {tab.title || 'New Tab'}
            </div>
            
            <button
              className="vb-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close tab"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <button
        className="vb-tab-add"
        onClick={onTabCreate}
        title="Add new tab"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default BrowserTabStrip;
