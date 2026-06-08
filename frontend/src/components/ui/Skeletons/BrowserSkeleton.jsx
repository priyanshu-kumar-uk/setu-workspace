import React from 'react';
import { motion } from 'framer-motion';
import './Skeletons.css';
const BrowserSkeleton = () => {
  return (
    <motion.div 
      className="browser-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="browser-skeleton-topbar">
        <div className="browser-skeleton-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <div className="browser-skeleton-address-bar shimmer" />
      </div>
      <div className="browser-skeleton-content">
        <div className="skeleton-line shimmer" style={{ width: '60%', height: '32px', marginBottom: '24px' }} />
        <div className="skeleton-line shimmer" style={{ width: '90%', height: '16px', marginBottom: '12px' }} />
        <div className="skeleton-line shimmer" style={{ width: '85%', height: '16px', marginBottom: '12px' }} />
        <div className="skeleton-line shimmer" style={{ width: '70%', height: '16px', marginBottom: '32px' }} />
        <div className="skeleton-grid">
          <div className="skeleton-card shimmer" />
          <div className="skeleton-card shimmer" />
          <div className="skeleton-card shimmer" />
        </div>
      </div>
    </motion.div>
  );
};
export default BrowserSkeleton;
