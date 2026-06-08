import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const messages = [
  "Connecting to room...",
  "Loading participants...",
  "Preparing workspace...",
  "Almost ready..."
];
const MeetingLoader = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="loader-content meeting-loader">
      <div className="wave-loader">
        <span className="wave-bar"></span>
        <span className="wave-bar"></span>
        <span className="wave-bar"></span>
      </div>
      <div style={{ height: '24px', position: 'relative', width: '200px', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="loader-message"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute' }}
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default MeetingLoader;
