import { useEffect, useRef, useState, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';
import { getSocketUrl } from '../../../config.js';
export function useBrowserSocket(roomId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (!roomId) return;
    const baseUrl = getSocketUrl();
    const socket = ioClient(`${baseUrl}/browser`, {
      query: { roomId, start_url: 'https://www.google.com' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      extraHeaders: { "ngrok-skip-browser-warning": "true" },
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('[BrowserSocket] Connected:', socket.id);
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('[BrowserSocket] Disconnected');
      setIsConnected(false);
    });
    socket.on('connect_error', (err) => {
      console.error('[BrowserSocket] Connection error:', err.message);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomId]);
  const getSocket = useCallback(() => socketRef.current, []);
  return { socket: socketRef.current, isConnected, getSocket };
}
