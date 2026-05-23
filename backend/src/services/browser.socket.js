/**
 * browser.socket.js
 * Socket.io event wiring for the virtual browser feature.
 * Uses the `/browser` namespace — fully isolated from any
 * future WebRTC or chat socket namespaces.
 */

import {
  getOrCreateSession,
  createTab,
  closeTab,
  switchTab,
  navigateTab,
  goBack,
  goForward,
  refreshTab,
  handleInteraction,
  addUser,
  removeUser,
  getTabsState,
} from './browser.manager.js';

/**
 * Attach browser socket handlers to the Socket.io server.
 * Call once from server.js after creating the io instance.
 */
export function initBrowserSocket(io) {
  const browserNs = io.of('/browser');

  browserNs.on('connection', async (socket) => {
    const roomId = socket.handshake.query.roomId;

    if (!roomId) {
      socket.emit('browser:error', { message: 'Missing roomId' });
      socket.disconnect(true);
      return;
    }

    console.log(`[BrowserSocket] User ${socket.id} joining room: ${roomId}`);

    // Join the Socket.io room
    socket.join(roomId);

    try {
      // Get or create the browser session for this room
      const session = await getOrCreateSession(roomId, io);
      addUser(roomId, socket.id);

      // Send current state to the joining user
      const tabsState = await getTabsState(roomId);
      if (tabsState) {
        socket.emit('browser:tabs-state', tabsState);
      }
    } catch (err) {
      console.error(`[BrowserSocket] Failed to initialise session for room ${roomId}:`, err.message);
      socket.emit('browser:error', { message: 'Failed to start browser session' });
    }


    socket.on('browser:create-tab', async () => {
      try {
        const result = await createTab(roomId);
        browserNs.to(roomId).emit('browser:tabs-state', result.tabsState);
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });

    socket.on('browser:close-tab', async ({ tabId }) => {
      try {
        const tabsState = await closeTab(roomId, tabId);
        if (tabsState) {
          browserNs.to(roomId).emit('browser:tabs-state', tabsState);
        }
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });

    socket.on('browser:switch-tab', async ({ tabId }) => {
      try {
        const tabsState = await switchTab(roomId, tabId);
        if (tabsState) {
          browserNs.to(roomId).emit('browser:tabs-state', tabsState);
        }
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });


    socket.on('browser:navigate', async ({ tabId, url }) => {
      try {
        const result = await navigateTab(roomId, tabId, url);
        browserNs.to(roomId).emit('browser:tab-updated', result);
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });

    socket.on('browser:back', async ({ tabId }) => {
      try {
        const result = await goBack(roomId, tabId);
        if (result) browserNs.to(roomId).emit('browser:tab-updated', result);
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });

    socket.on('browser:forward', async ({ tabId }) => {
      try {
        const result = await goForward(roomId, tabId);
        if (result) browserNs.to(roomId).emit('browser:tab-updated', result);
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });

    socket.on('browser:refresh', async ({ tabId }) => {
      try {
        const result = await refreshTab(roomId, tabId);
        if (result) browserNs.to(roomId).emit('browser:tab-updated', result);
      } catch (err) {
        socket.emit('browser:error', { message: err.message });
      }
    });


    socket.on('browser:interact', async ({ tabId, action }) => {
      try {
        await handleInteraction(roomId, tabId, action);
      } catch {
        // Silently ignore interaction errors
      }
    });


    socket.on('disconnect', async () => {
      console.log(`[BrowserSocket] User ${socket.id} disconnected from room: ${roomId}`);
      try {
        await removeUser(roomId, socket.id);
      } catch (err) {
        console.error(`[BrowserSocket] Cleanup error for room ${roomId}:`, err.message);
      }
    });
  });

  console.log('[BrowserSocket] /browser namespace initialised');
}
