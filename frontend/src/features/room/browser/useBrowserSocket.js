/**
 * useBrowserSocket.js
 * ─────────────────────────────────────────────────────────────
 * Custom React hook that manages a Socket.io connection to
 * the /browser namespace for a specific room.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';

/**
 * @param {string} roomId — The room to join
 * @returns {{ socket, isConnected }}
 */
export function useBrowserSocket(roomId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Connect to the /browser namespace with roomId as a query param
    const socket = ioClient('/browser', {
      query: { roomId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
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
