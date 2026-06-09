import MeetingLog from '../models/meeting.log.model.js';
import ScheduledMeeting from '../models/scheduled.meeting.model.js';
export const activeRooms = new Map();
export const chatHistories = new Map();
export const initRoomSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('room:join', async (payload) => {
      const { roomId, displayName, userId, audio, video } = payload || {};
      if (!roomId) {
        console.warn('[Socket] room:join called without roomId');
        return;
      }
      socket.join(roomId);
      const name = displayName || 'Guest';
      const checkInTime = new Date();
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, { 
          peers: new Map(), 
          ownerId: socket.id, 
          ownerUserId: userId,
          scheduledHostId: undefined 
        });
      }
      const room = activeRooms.get(roomId);
      let role = 'Participant';
      let scheduled = null;
      try {
        scheduled = await ScheduledMeeting.findOne({ roomId }).lean();
        if (room.scheduledHostId === undefined) {
          room.scheduledHostId = scheduled && scheduled.hostId ? scheduled.hostId.toString() : null;
        }
        if (room.scheduledHostId) {
          if (userId && room.scheduledHostId === userId.toString()) {
            role = 'Host';
            room.ownerId = socket.id; 
          } else if (room.ownerId === socket.id && (!userId || room.scheduledHostId !== userId.toString())) {
            role = 'Participant';
            room.ownerId = null; 
          }
        } else {
          if (room.ownerUserId) {
            if (userId && room.ownerUserId === userId.toString()) {
              role = 'Host';
              room.ownerId = socket.id; 
            } else if (room.ownerId === socket.id && userId !== room.ownerUserId) {
              role = 'Participant';
            }
          } else {
            if (room.ownerId === socket.id) {
              role = 'Host';
            }
          }
        }
        room.peers.set(socket.id, { 
          joinedAt: Date.now(), 
          displayName: name, 
          userId,
          audio: audio ?? true,
          video: video ?? true
        });
        let logTitle = ` ${roomId}`;
        let logDescription = '';
        if (scheduled) {
          logTitle = scheduled.title || logTitle;
          logDescription = scheduled.description || logDescription;
        }
        const initialParticipants = Array.from(room.peers.entries()).map(([peerSocketId, peerData]) => ({
          userId: peerData.userId || null,
          displayName: peerData.displayName || 'Unknown',
          socketId: peerSocketId,
          joinedAt: new Date(peerData.joinedAt)
        }));
        await MeetingLog.create({
          userId: userId || null,
          roomId,
          title: logTitle,
          description: logDescription,
          role,
          startTime: checkInTime,
          participants: initialParticipants
        });
        await MeetingLog.updateMany(
          { roomId, endTime: null, "participants.socketId": { $ne: socket.id } },
          { 
            $push: { 
              participants: { 
                userId: userId || null, 
                displayName: name, 
                socketId: socket.id, 
                joinedAt: checkInTime 
              } 
            } 
          }
        );
      } catch (err) {
        console.error('[DB] Failed to sync meeting logs:', err);
      }
      socket.emit('room:initial-peers', {
        peers: Array.from(room.peers.entries()).map(([id, data]) => ({
          socketId: id,
          displayName: data.displayName || 'Unknown',
          audio: data.audio ?? true,
          video: data.video ?? true,
          isHandRaised: data.isHandRaised || false
        })),
        roomOwnerId: room.ownerId,
        screenShareState: room.screenShareState || { activeScreenSharerId: null, activeScreenSharerName: null, isScreenSharing: false, type: null }
      });
      if (chatHistories.has(roomId)) {
        socket.emit('chat:history', chatHistories.get(roomId));
      } else {
        socket.emit('chat:history', []);
      }
      socket.to(roomId).emit('webrtc:user-joined', {
        socketId: socket.id,
        displayName: name,
        audio: audio ?? true,
        video: video ?? true,
        roomOwnerId: room.ownerId
      });
    });
    socket.on('chat:send', (payload) => {
      const { roomId, senderName, text } = payload || {};
      if (!roomId || !text) return;
      const timeString = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const message = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        senderName: senderName || 'Unknown',
        text,
        time: timeString
      };
      if (!chatHistories.has(roomId)) {
        chatHistories.set(roomId, []);
      }
      chatHistories.get(roomId).push(message);
      io.to(roomId).emit('chat:receive', message);
    });
    socket.on('webrtc:signal-send', (payload) => {
      const { targetSocketId, signal } = payload || {};
      if (!targetSocketId || !signal) return;
      io.to(targetSocketId).emit('webrtc:signal-receive', {
        fromSocketId: socket.id,
        signal
      });
    });
    socket.on('toggle-media', (payload) => {
      const { roomId, audio, video } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room && room.peers.has(socket.id)) {
        const peer = room.peers.get(socket.id);
        peer.audio = audio;
        peer.video = video;
      }
      socket.to(roomId).emit('user-toggled-media', {
        socketId: socket.id,
        audio,
        video
      });
    });
    socket.on('user:raise-hand', (payload) => {
      const { roomId, isRaised } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room && room.peers.has(socket.id)) {
         room.peers.get(socket.id).isHandRaised = isRaised;
      }
      socket.to(roomId).emit('user:raise-hand', {
        socketId: socket.id,
        isRaised
      });
    });
    socket.on('webrtc:speaking-toggle', (payload) => {
      const { roomId, isSpeaking } = payload || {};
      if (!roomId) return;
      socket.to(roomId).emit('user-toggled-speaking', {
        socketId: socket.id,
        isSpeaking
      });
    });
    socket.on('SCREEN_SHARE_STARTED', (payload) => {
      const { roomId, activeScreenSharerName, type } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room) {
        room.screenShareState = {
          activeScreenSharerId: socket.id,
          activeScreenSharerName,
          isScreenSharing: true,
          type
        };
      }
      socket.to(roomId).emit('SCREEN_SHARE_STARTED', room.screenShareState);
    });
    socket.on('SCREEN_SHARE_STOPPED', (payload) => {
      const { roomId } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room && room.screenShareState && room.screenShareState.activeScreenSharerId === socket.id) {
        room.screenShareState = {
          activeScreenSharerId: null,
          activeScreenSharerName: null,
          isScreenSharing: false,
          type: null
        };
        socket.to(roomId).emit('SCREEN_SHARE_STOPPED');
      }
    });
    socket.on('SCREEN_SHARE_TAKEOVER_REQUEST', (payload) => {
      const { roomId, activeScreenSharerName, type } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room && room.screenShareState && room.screenShareState.isScreenSharing) {
        const oldSharerId = room.screenShareState.activeScreenSharerId;
        if (oldSharerId && oldSharerId !== socket.id) {
          io.to(oldSharerId).emit('SCREEN_SHARE_TAKEN_OVER', {
            newSharerName: activeScreenSharerName || 'Someone'
          });
        }
      }
      if (room) {
        room.screenShareState = {
          activeScreenSharerId: socket.id,
          activeScreenSharerName,
          isScreenSharing: true,
          type
        };
      }
      socket.to(roomId).emit('SCREEN_SHARE_STARTED', room ? room.screenShareState : null);
    });
    socket.on('workspace:sync-state', (payload) => {
      const { roomId, isActive, hostSocketId, type } = payload || {};
      if (!roomId) return;
      const room = activeRooms.get(roomId);
      if (room) {
         room.screenShareState = {
           activeScreenSharerId: isActive ? hostSocketId : null,
           activeScreenSharerName: 'Legacy User',
           isScreenSharing: isActive,
           type
         };
      }
      socket.to(roomId).emit('workspace:sync-state', {
        isActive,
        hostSocketId,
        type
      });
    });
    socket.on('disconnect', async () => {
      const checkoutTime = new Date();
      for (const [roomId, room] of activeRooms.entries()) {
        if (room.peers.has(socket.id)) {
          const peerData = room.peers.get(socket.id);
          room.peers.delete(socket.id);
          socket.to(roomId).emit('webrtc:user-left', { socketId: socket.id });
          try {
            await MeetingLog.updateMany(
              { roomId, "participants.socketId": socket.id },
              { $set: { "participants.$.leftAt": checkoutTime } }
            );
            const log = await MeetingLog.findOne({ 
              userId: peerData.userId || null, 
              roomId, 
              endTime: null 
            }).sort({ startTime: -1 });
            if (log) {
              log.endTime = checkoutTime;
              log.durationInMinutes = Math.round((log.endTime - log.startTime) / 60000);
              await log.save();
            }
          } catch (err) {
            console.error('[DB] Failed to mark disconnect logs:', err);
          }
          if (room.peers.size === 0) {
            setTimeout(() => {
              const currentRoom = activeRooms.get(roomId);
              if (!currentRoom || currentRoom.peers.size === 0) {
                activeRooms.delete(roomId);
                chatHistories.delete(roomId);
              }
            }, 5000);
          }
        }
      }
    });
  });
};