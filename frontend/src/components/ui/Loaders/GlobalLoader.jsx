import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../../context/LoadingContext';
import './GlobalLoader.css';
import MeetingLoader from './MeetingLoader';
const GlobalLoader = ({ navigationState }) => {
  const { isLoaderVisible, loaderType, message } = useLoading();
  const isNavigating = navigationState === 'loading';
  const showOverlay = isLoaderVisible || isNavigating;
  let LoaderContent = null;
  if (isNavigating || loaderType === 'ROUTE') {
    LoaderContent = (
      <div className="loader-content route-loader">
        <div className="ring-loader" />
        <p className="loader-message">{message || 'Preparing your workspace...'}</p>
      </div>
    );
  } else if (loaderType === 'AUTH') {
    LoaderContent = (
      <div className="loader-content auth-loader">
        <div className="ring-loader" />
        <p className="loader-message">{message || 'Checking authentication...'}</p>
      </div>
    );
  } else if (loaderType === 'MEETING') {
    LoaderContent = <MeetingLoader />;
  }
  return (
    <>
      {}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="top-progress-bar"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="global-loader-overlay"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
          >
            {LoaderContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default GlobalLoader;
