import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
const LoadingContext = createContext(null);
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
export const LoadingProvider = ({ children }) => {
  const [loaderType, setLoaderType] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const startLoading = useCallback((type = 'DEFAULT', msg = '') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startTimeRef.current = Date.now();
    setLoaderType(type);
    setMessage(msg);
    setIsLoaderVisible(true);
  }, []);
  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, 500 - elapsed);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoaderVisible(false);
      setTimeout(() => {
        setLoaderType(null);
        setMessage('');
      }, 300);
    }, remaining);
  }, []);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const value = {
    isLoaderVisible,
    loaderType,
    message,
    startLoading,
    stopLoading
  };
  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
