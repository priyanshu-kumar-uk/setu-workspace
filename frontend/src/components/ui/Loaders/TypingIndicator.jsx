import React from 'react';
import { motion } from 'framer-motion';
const TypingIndicator = () => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2
      }
    },
    end: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const circleVariants = {
    start: {
      y: 0
    },
    end: {
      y: -6
    }
  };
  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(11, 92, 255, 0.05)', borderRadius: '16px', width: 'fit-content', border: '1px solid rgba(11, 92, 255, 0.1)' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--primary-blue, #0B5CFF)', fontWeight: 500 }}>AI is thinking</span>
      <motion.div
        style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '10px' }}
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        <motion.span
          style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-blue, #0B5CFF)', borderRadius: '50%' }}
          variants={circleVariants}
          transition={circleTransition}
        />
        <motion.span
          style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-blue, #0B5CFF)', borderRadius: '50%' }}
          variants={circleVariants}
          transition={circleTransition}
        />
        <motion.span
          style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-blue, #0B5CFF)', borderRadius: '50%' }}
          variants={circleVariants}
          transition={circleTransition}
        />
      </motion.div>
    </div>
  );
};
export default TypingIndicator;
