import React from 'react';
import { motion } from 'framer-motion';
const ErrorState = ({ message = "Couldn't load this content.", onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="error-state-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        background: '#fff',
        border: '1px solid #fee2e2',
        borderRadius: '12px',
        gap: '12px',
        textAlign: 'center'
      }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p style={{ margin: 0, color: '#0f172a', fontWeight: 500 }}>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: '#0f172a',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#f8fafc'}
          onMouseOut={(e) => e.target.style.background = 'white'}
        >
          Retry
        </button>
      )}
    </motion.div>
  );
};
export default ErrorState;
