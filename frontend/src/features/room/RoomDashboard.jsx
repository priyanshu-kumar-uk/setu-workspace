import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSocketUrl } from '../../config';
import { AnimatePresence, motion } from 'framer-motion';
import { io as ioClient } from 'socket.io-client';
import {
  Mic, MicOff, Video, VideoOff, MessageSquare, X, Send,
  Sparkles, Users, ArrowUp, Globe, FileText, Search, MoreVertical, UserPlus,
  Copy, Check, Link, Hand, Maximize, Layout, Monitor, ScreenShare, WifiOff
} from 'lucide-react';
import RoomChatPage from '../assistant/page/RoomChatPage';
import RoomDocsOverlay from './RoomDocsOverlay';
import VirtualBrowser from './browser/VirtualBrowser';
import { authGetme } from '../auth/hooks/api.hooks';
import { useLoading } from '../../context/LoadingContext';
import './RoomDashboard.css';
const useNetworkState = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOffline;
};
const OfflineOverlay = () => (
  <div className="rd-offline-overlay">
    <div className="rd-offline-pulse-wrapper">
      <WifiOff size={48} className="rd-offline-icon" />
    </div>
    <h2 className="rd-offline-title">Connection Lost</h2>
    <p className="rd-offline-text">
      We've lost connection to your network. Trying to automatically reconnect to the Setu workspace...
    </p>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Gradient Hashing Utility
// ─────────────────────────────────────────────────────────────────────────────
const SAAS_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)', // Indigo to Violet
  'linear-gradient(135deg, #3b82f6, #0ea5e9)', // Blue to Sky
  'linear-gradient(135deg, #ec4899, #f43f5e)', // Pink to Rose
  'linear-gradient(135deg, #10b981, #14b8a6)', // Emerald to Teal
  'linear-gradient(135deg, #f59e0b, #ef4444)', // Amber to Red
  'linear-gradient(135deg, #8b5cf6, #d946ef)', // Violet to Fuchsia
  'linear-gradient(135deg, #0ea5e9, #10b981)', // Sky to Emerald
];
const getAvatarGradient = (identifier) => {
  if (!identifier) return SAAS_GRADIENTS[0];
  const str = String(identifier);
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return SAAS_GRADIENTS[sum % SAAS_GRADIENTS.length];
};
// ─────────────────────────────────────────────────────────────────────────────
// Animated Speaking Dots Component
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedSpeakingDots = () => (
  <div className="rd-speaking-dots">
    <span />
    <span />
    <span />
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────
// VideoTile — useCallback ref binds srcObject the instant DOM node mounts
// ─────────────────────────────────────────────────────────────────────────────
const VideoTile = ({ stream, isLocal, isHost, label, isVideoOn, isMuted, isHandRaised, isScreenShare = false, isSpeaking = false, identifier }) => {
  const setVideoRef = useCallback(node => {
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch(e => console.warn('[VideoTile] Autoplay blocked:', e));
    }
  }, [stream]);
  const tileBackground = getAvatarGradient(identifier || label);
  return (
    <div className={`rd-video-container ${isLocal ? 'rd-local-video' : ''} ${isScreenShare ? 'rd-screen-share' : ''} ${isSpeaking ? 'rd-speaking-active' : ''}`} style={{ position: 'relative' }}>
      {isVideoOn || isScreenShare ? (
        <video
          ref={setVideoRef}
          autoPlay
          muted={isLocal}
          playsInline
          style={{
            transform: isScreenShare ? 'scaleX(1)' : 'scaleX(-1)',
            objectFit: isScreenShare ? 'contain' : 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        <>
          {/* Keep video element mounted strictly for remote audio playback, but visually hidden */}
          <video
            ref={setVideoRef}
            autoPlay
            muted={isLocal}
            playsInline
            style={{ display: 'none' }}
          />
          <div className="rd-video-off-indicator" style={{ background: tileBackground, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="rd-avatar-circle" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '36px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {label ? label.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </>
      )}
      <div className="rd-video-label" style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '11px', fontWeight: '500', zIndex: 10, display: 'flex', alignItems: 'center' }}>
        {label}{isHost ? ' · Host' : ''}{isScreenShare ? ' · Screen' : ''}
        {isSpeaking && <AnimatedSpeakingDots />}
      </div>
      {isMuted && (
        <div className="rd-mute-indicator" style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(234, 67, 53, 0.9)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <MicOff size={14} color="white" />
        </div>
      )}
      {isHandRaised && (
        <div className="rd-hand-indicator" style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#fbbc04', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          <Hand size={14} color="#202124" />
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// SharedScreenPresentationArea
// ─────────────────────────────────────────────────────────────────────────────
const SharedScreenPresentationArea = ({ 
  activeScreenPresenter, 
  sharedScreenInfo, 
  roomId, 
  showBrowser, 
  setShowBrowser, 
  isBrowserFullscreen, 
  setIsBrowserFullscreen, 
  showDocsOverlay, 
  setShowDocsOverlay,
  iAmHost,
  isMicMuted,
  isMyHandRaised,
  roomOwnerId,
  mutedPeers,
  raisedHands
}) => {
  if (!activeScreenPresenter) return null;
  if (activeScreenPresenter.isLocal) {
    return sharedScreenInfo.type === 'internal' ? (
      <div id="nexus-workspace-area" className="rd-internal-workspace-container" style={{ width: '100%', height: '100%', display: 'flex', borderRadius: '12px', overflow: 'hidden' }}>
        {showBrowser && <VirtualBrowser roomId={roomId} onClose={() => setShowBrowser(false)} isFullscreen={isBrowserFullscreen} onToggleFullscreen={() => setIsBrowserFullscreen(p => !p)} />}
        <RoomDocsOverlay roomId={roomId} onClose={() => setShowDocsOverlay(false)} isVisible={showDocsOverlay} />
      </div>
    ) : (
      <VideoTile stream={activeScreenPresenter.stream} isLocal isHost={iAmHost} isVideoOn={true} label={`${activeScreenPresenter.displayName} · Presenting`} identifier={activeScreenPresenter.socketId || 'local_presenter'} isMuted={isMicMuted} isHandRaised={isMyHandRaised} isScreenShare={true} />
    );
  }
  return (
    <VideoTile stream={activeScreenPresenter.screenStream} isLocal={false} isHost={activeScreenPresenter.socketId === roomOwnerId} isVideoOn={true} label={activeScreenPresenter.displayName || 'Guest'} identifier={activeScreenPresenter.socketId} isMuted={activeScreenPresenter.audio === false || mutedPeers.has(activeScreenPresenter.socketId)} isHandRaised={raisedHands.has(activeScreenPresenter.socketId)} isScreenShare={true} />
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// ParticipantVerticalSidebar
// ─────────────────────────────────────────────────────────────────────────────
const ParticipantVerticalSidebar = ({ visibleSidebarParticipants, isMeSpeaking }) => {
  return (
    <>
      {visibleSidebarParticipants.map((p) => (
        <div key={p.id} className="rd-sidebar-tile-wrapper">
          <VideoTile 
            stream={p.stream} 
            isScreenShare={false} 
            label={p.label}
            identifier={p.id}
            isLocal={p.isLocal}
            isHost={p.isHost}
            isVideoOn={p.isVideoOn}
            isMuted={p.isMuted}
            isHandRaised={p.isHandRaised}
            isSpeaking={p.isLocal ? isMeSpeaking : p.isSpeaking}
          />
        </div>
      ))}
    </>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// RoomDashboard
// ─────────────────────────────────────────────────────────────────────────────
const RoomDashboard = ({ initialMicMuted = false, initialVideoOn = true }) => {
  const isOffline = useNetworkState();
  const isOfflineRef = useRef(isOffline);
  useEffect(() => { isOfflineRef.current = isOffline; }, [isOffline]);
  const navigate = useNavigate();
  const { roomId } = useParams();
  // UI state
  const [activePanel, setActivePanel] = useState('none');
  const [showDocsOverlay, setShowDocsOverlay] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(initialMicMuted);
  const [isVideoOn, setIsVideoOn] = useState(initialVideoOn);
  const [showBrowser, setShowBrowser] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [mutedPeers, setMutedPeers] = useState(new Set());
  const [linkCopied, setLinkCopied] = useState(false);
  const [isMyHandRaised, setIsMyHandRaised] = useState(false);
  const [isMeSpeaking, setIsMeSpeaking] = useState(false);
  const [incomingChatToast, setIncomingChatToast] = useState(null);
  const chatToastTimerRef = useRef(null);
  const activePanelRef = useRef(activePanel);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);
  const { stopLoading } = useLoading();
  // Premium loader minimum duration (let them read the rotating messages)
  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading();
    }, 2800);
    return () => clearTimeout(timer);
  }, [stopLoading]);
  // ── MODULE 1: Share modal state ─────────────────────────────────────────
  const [showShareModal, setShowShareModal] = useState(false);
  const shareModalRef = useRef(null);
  // ── MODULE 3: Screen share layout sync state ────────────────────────────
  const [screenShareState, setScreenShareState] = useState({ 
    activeScreenSharerId: null, 
    activeScreenSharerName: null, 
    isScreenSharing: false, 
    type: null 
  });
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const moreMenuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  // WebRTC state
  // remoteStreams = Array<{ socketId: string, stream: MediaStream }>
  // We add an entry as soon as we have a live MediaStream from ontrack.
  // When the connection reaches "connected" and we still have no entry,
  // we create a placeholder MediaStream so the tile appears regardless.
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localSocketId, setLocalSocketId] = useState(null);
  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  // FIX 1: Separate stream for the display capture (screen share) so presenter view
  // shows the captured content, not the webcam feed.
  const [presentationStream, setPresentationStream] = useState(null);
  const presentationStreamRef = useRef(null);
  // Refs
  const chatBottomRef = useRef(null);
  const localStreamRef = useRef(null);           // always has the current local MediaStream
  const socketRef = useRef(null);
  const peersRef = useRef(new Map());            // Map<socketId, RTCPeerConnection> for Camera
  const pendingIceRef = useRef(new Map());       // Map<socketId, RTCIceCandidate[]> for Camera
  const screenPeersRef = useRef(new Map());      // Map<socketId, RTCPeerConnection> for Screen Share
  const screenPendingIceRef = useRef(new Map()); // Map<socketId, RTCIceCandidate[]> for Screen Share
  // remoteStreamsRef mirrors remoteStreams state so PC callbacks can read it synchronously
  const remoteStreamsRef = useRef([]);
  // displayNamesRef: socketId → displayName, for naming video tiles
  const displayNamesRef = useRef(new Map());
  // initialMediaStateRef: socketId → { audio, video }
  const initialMediaStateRef = useRef(new Map());
  // ── Helpers ───────────────────────────────────────────────────────────────
  // Upsert a remote stream entry:
  // type 'camera' or 'screen' to cleanly decouple parallel streams
  const upsertRemoteStream = useCallback((socketId, incomingStream, type = 'camera') => {
    setRemoteStreams(prev => {
      const idx = prev.findIndex(s => s.socketId === socketId);
      const displayName = displayNamesRef.current.get(socketId) || 'Guest';
      const initialMedia = initialMediaStateRef.current.get(socketId) || { audio: true, video: true };
      const existing = idx !== -1 ? prev[idx] : { 
        socketId, 
        stream: null, 
        screenStream: null, 
        displayName, 
        audio: initialMedia.audio, 
        video: initialMedia.video,
        isSpeaking: false 
      };
      const next = [...prev];
      if (type === 'screen') {
        existing.screenStream = incomingStream;
      } else {
        existing.stream = incomingStream;
      }
      if (idx !== -1) next[idx] = existing;
      else next.push(existing);
      remoteStreamsRef.current = next;
      return next;
    });
  }, []);
  const removeRemoteStream = useCallback((socketId) => {
    setRemoteStreams(prev => {
      const next = prev.filter(s => s.socketId !== socketId);
      remoteStreamsRef.current = next;
      return next;
    });
  }, []);
  // ── Web Audio API: Active Speaker Detection ────────────────────────────────
  useEffect(() => {
    if (!localStream) return;
    // Only analyze if mic is on
    if (isMicMuted) {
       if (isMeSpeaking) {
         setIsMeSpeaking(false);
         socketRef.current?.emit('webrtc:speaking-toggle', { roomId, isSpeaking: false });
       }
       return;
    }
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    let source;
    try {
      const audioStream = new MediaStream([audioTrack]);
      source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);
    } catch (e) {
      console.warn("[AudioAnalysis] Could not create media stream source", e);
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId;
    let speakingTimeoutId;
    let startSpeakingTimeoutId;
    let currentlySpeaking = false;
    const checkAudioLevel = () => {
      if (isOfflineRef.current) {
        animationFrameId = requestAnimationFrame(checkAudioLevel);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      if (average > 15) {
        if (speakingTimeoutId) {
          clearTimeout(speakingTimeoutId);
          speakingTimeoutId = null;
        }
        if (!currentlySpeaking && !startSpeakingTimeoutId) {
          startSpeakingTimeoutId = setTimeout(() => {
            currentlySpeaking = true;
            setIsMeSpeaking(true);
            socketRef.current?.emit('webrtc:speaking-toggle', { roomId, isSpeaking: true });
          }, 150);
        }
      } else {
        if (startSpeakingTimeoutId) {
          clearTimeout(startSpeakingTimeoutId);
          startSpeakingTimeoutId = null;
        }
        if (currentlySpeaking && !speakingTimeoutId) {
          speakingTimeoutId = setTimeout(() => {
            currentlySpeaking = false;
            setIsMeSpeaking(false);
            socketRef.current?.emit('webrtc:speaking-toggle', { roomId, isSpeaking: false });
          }, 500);
        }
      }
      animationFrameId = requestAnimationFrame(checkAudioLevel);
    };
    checkAudioLevel();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (speakingTimeoutId) clearTimeout(speakingTimeoutId);
      if (startSpeakingTimeoutId) clearTimeout(startSpeakingTimeoutId);
      try { source?.disconnect(); } catch (e) {}
      try { audioCtx.close(); } catch (e) {}
    };
  }, [localStream, isMicMuted, roomId, isMeSpeaking]);
  // Drain buffered ICE candidates after setRemoteDescription
  const drainIce = useCallback(async (remoteId, pc, isScreen = false) => {
    const queueMap = isScreen ? screenPendingIceRef : pendingIceRef;
    const queue = queueMap.current.get(remoteId) || [];
    if (queue.length === 0) return;
    console.log(`[ICE] Draining ${queue.length} ${isScreen ? 'screen' : 'camera'} candidates for '${remoteId}'`);
    for (const candidate of queue) {
      try { await pc.addIceCandidate(candidate); }
      catch (e) { console.warn('[ICE] drain error:', e); }
    }
    queueMap.current.set(remoteId, []);
  }, []);
  // ── PC Factory ────────────────────────────────────────────────────────────
  // Creates a new RTCPeerConnection for `remoteId`.
  // Does NOT create offer/answer — the caller does that.
  const makePeerConnection = useCallback((remoteId, socket, connectionType = 'camera') => {
    console.log(`[PC] Creating ${connectionType} connection for '${remoteId}'`);
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    });
    const isScreen = connectionType === 'screen';
    // Bind the appropriate local stream to this peer connection
    const stream = isScreen ? presentationStreamRef.current : localStreamRef.current;
    if (stream && stream.getTracks().length > 0) {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      console.log(`[PC] Added ${stream.getTracks().length} ${connectionType} tracks for '${remoteId}'`);
    } else {
      console.warn(`[PC] No local ${connectionType} tracks for '${remoteId}' — peer won't receive media`);
    }
    // Trickle ICE — tag candidate with connectionType
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('webrtc:signal-send', {
          targetSocketId: remoteId,
          signal: { type: 'candidate', candidate, connectionType }
        });
      }
    };
    pc.onicegatheringstatechange = () => {
      console.log(`[ICE] Gathering [${remoteId}]: ${pc.iceGatheringState}`);
    };
    // ── ontrack ─────────────────────────────────────────────────────────
    pc.ontrack = ({ streams, track }) => {
      console.log(`[PC] ontrack [${track.kind}] from '${remoteId}' on ${connectionType} channel`);
      const remoteStream = streams[0];
      if (!remoteStream) {
        console.warn(`[PC] ontrack: event.streams[0] is empty for '${remoteId}'`);
        return;
      }
      // Explicitly register this track into the respective stream field
      upsertRemoteStream(remoteId, remoteStream, connectionType);
    };
    // ── connection state ─────────────────────────────────────────────────
    // When the connection reaches 'connected', if ontrack hasn't fired yet
    // (e.g. the remote peer has no media), we still add a placeholder stream
    // so the participant tile appears in the grid.
    pc.onconnectionstatechange = () => {
      console.log(`[PC] connectionState [${remoteId}]: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        const alreadyRegistered = remoteStreamsRef.current.some(s => s.socketId === remoteId);
        if (!alreadyRegistered && !isScreen) {
          // Remote peer has no tracks; show a tile anyway so they're visible
          console.log(`[PC] '${remoteId}' connected with no tracks — adding placeholder tile`);
          upsertRemoteStream(remoteId, new MediaStream(), 'camera');
        }
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (isScreen) {
          screenPeersRef.current.delete(remoteId);
          screenPendingIceRef.current.delete(remoteId);
          // Nullify screen stream but keep camera
          upsertRemoteStream(remoteId, null, 'screen');
        } else {
          removeRemoteStream(remoteId);
          peersRef.current.delete(remoteId);
          pendingIceRef.current.delete(remoteId);
        }
      }
    };
    return pc;
  }, [upsertRemoteStream, removeRemoteStream]);
  // ── Fetch logged-in user's display name ──────────────────────────────────
  const { data: meData } = authGetme();
  const myDisplayName = meData?.data
    ? `${meData.data.firstname || ''} ${meData.data.lastname || ''}`.trim() || 'You'
    : 'You';
  const myDisplayNameRef = useRef(myDisplayName);
  const myUserId = meData?.data?._id || null;
  const myUserIdRef = useRef(myUserId);
  useEffect(() => {
    myDisplayNameRef.current = myDisplayName;
    myUserIdRef.current = myUserId;
  }, [myDisplayName, myUserId]);
  // ─────────────────────────────────────────────────────────────────────────
  // MAIN INIT EFFECT
  // Order: getUserMedia → socket create → register handlers → socket.connect()
  // This guarantees localStreamRef.current is always set before any signaling event fires.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // ── 1. GET MEDIA — fallback chain ───────────────────────────────────
      // Try: video+audio → audio-only → silent dummy stream
      // A dummy stream means we can still negotiate with peers (they'll see
      // us as "camera off") rather than having an offer with zero m-lines,
      // which some browsers handle poorly.
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log('[Media] Got video+audio stream');
      } catch (err) {
        console.warn('[Media] video+audio failed:', err.message, '— trying audio-only');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[Media] Got audio-only stream');
        } catch (err2) {
          console.warn('[Media] audio-only failed:', err2.message, '— using silent dummy stream');
          // Create a silent dummy stream so PeerConnections always have
          // at least one track to negotiate (avoids zero m-line SDPs)
          try {
            const ctx = new AudioContext();
            const dest = ctx.createMediaStreamDestination();
            stream = dest.stream;
            console.log('[Media] Using silent dummy audio stream');
          } catch (err3) {
            console.error('[Media] All media acquisition failed:', err3);
          }
        }
      }
      if (cancelled) { stream?.getTracks().forEach(t => t.stop()); return; }
      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        stream.getAudioTracks().forEach(t => { t.enabled = !initialMicMuted; });
        stream.getVideoTracks().forEach(t => { t.enabled = initialVideoOn; });
      }
      // ── 2. CREATE SOCKET (not connected yet) ────────────────────────────
      const socketUrl = getSocketUrl();
      const socket = ioClient(socketUrl, { 
        autoConnect: false, 
        transports: ['websocket'],
        extraHeaders: { "ngrok-skip-browser-warning": "true" } 
      });
      socketRef.current = socket;
      // ── 3. REGISTER ALL HANDLERS BEFORE CONNECTING ──────────────────────
      socket.on('connect', () => {
        if (cancelled) return;
        setLocalSocketId(socket.id);
        console.log('[Socket] Connected as', socket.id);
        // Send our display name and initial media state so other peers can show our real name and state
        socket.emit('room:join', { 
          roomId, 
          displayName: myDisplayNameRef.current, 
          userId: myUserIdRef.current,
          audio: !initialMicMuted,
          video: initialVideoOn
        });
      });
      socket.on('connect_error', err => console.error('[Socket] connect_error:', err));
      socket.on('disconnect', reason => {
        console.log('[Socket] disconnected:', reason);
        if (cancelled) return;
        // Tear down all peers on disconnect to ensure clean state upon reconnection
        peersRef.current.forEach(pc => pc.close());
        peersRef.current.clear();
        pendingIceRef.current.clear();
        screenPeersRef.current.forEach(pc => pc.close());
        screenPeersRef.current.clear();
        screenPendingIceRef.current.clear();
        remoteStreamsRef.current = [];
        setRemoteStreams([]);
        setScreenShareState({ activeScreenSharerId: null, activeScreenSharerName: null, isScreenSharing: false, type: null });
        setMutedPeers(new Set());
        setRaisedHands(new Set());
      });
      // ── room:initial-peers ─────────────────────────────────────────────
      // Fires ONLY on the JOINING user.
      // peers[] = socket IDs of everyone already in the room.
      // Each of those existing users will act as CALLER and send us an offer.
      // We do NOT create PCs here — we create them lazily when the offer arrives.
      // We DO pre-allocate ICE queues so candidates that arrive before the offer
      // are buffered rather than dropped.
      socket.on('room:initial-peers', ({ peers, roomOwnerId: ownerId, screenShareState: initialScreenShareState }) => {
        if (cancelled) return;
        console.log('[Signal] room:initial-peers — existing peers:', peers, '| owner:', ownerId);
        setRoomOwnerId(ownerId);
        if (initialScreenShareState) {
           setScreenShareState(initialScreenShareState);
        }
        // peers is now Array<{ socketId, displayName, audio, video, isHandRaised }>
        peers.forEach(({ socketId: peerId, displayName, audio, video, isHandRaised }) => {
          // Store their name so video tiles can show it
          displayNamesRef.current.set(peerId, displayName);
          initialMediaStateRef.current.set(peerId, { audio: audio ?? true, video: video ?? true });
          if (isHandRaised) {
             setRaisedHands(prev => {
                const next = new Set(prev);
                next.add(peerId);
                return next;
             });
          }
          if (!pendingIceRef.current.has(peerId)) {
            pendingIceRef.current.set(peerId, []);
          }
        });
        // PCs are created when offers arrive (see 'offer' branch below)
      });
      // ── Ephemeral Chat ─────────────────────────────────────────────────
      socket.on('chat:history', (messages) => {
        if (cancelled) return;
        setChatMessages(messages);
      });
      socket.on('chat:receive', (message) => {
        if (cancelled) return;
        setChatMessages(prev => [...prev, message]);
        if (activePanelRef.current !== 'chat' && message.senderName !== myDisplayNameRef.current) {
           setIncomingChatToast(message);
           if (chatToastTimerRef.current) clearTimeout(chatToastTimerRef.current);
           chatToastTimerRef.current = setTimeout(() => setIncomingChatToast(null), 3000);
        }
      });
      // ── Media Toggle Indicator ─────────────────────────────────────────
      socket.on('user-toggled-media', ({ socketId: incomingSocketId, audio, video }) => {
        if (cancelled) return;
        // Use exact functional callback form to prevent stale closures
        setRemoteStreams(prevStreams => prevStreams.map(p => 
          p.socketId === incomingSocketId 
            ? { ...p, audio, video } 
            : p
        ));
        // Also keep mutedPeers updated for backward compatibility
        setMutedPeers(prev => {
          const next = new Set(prev);
          if (!audio) next.add(incomingSocketId);
          else next.delete(incomingSocketId);
          return next;
        });
      });
      // ── Speaking Indicator ─────────────────────────────────────────────
      socket.on('user-toggled-speaking', ({ socketId: incomingSocketId, isSpeaking }) => {
        if (cancelled) return;
        setRemoteStreams(prevStreams => prevStreams.map(p => 
          p.socketId === incomingSocketId 
            ? { ...p, isSpeaking } 
            : p
        ));
      });
      // ── Hand Raise Indicator ───────────────────────────────────────────
      socket.on('user:raise-hand', ({ socketId: peerId, isRaised }) => {
        if (cancelled) return;
        setRaisedHands(prev => {
          const next = new Set(prev);
          if (isRaised) next.add(peerId);
          else next.delete(peerId);
          return next;
        });
      });
      // ── webrtc:user-joined ─────────────────────────────────────────────
      // Fires ONLY on existing users when someone new joins.
      // We are the CALLER — create PC, add tracks, create offer, send it.
      socket.on('webrtc:user-joined', async ({ socketId: newPeerId, displayName, audio, video, roomOwnerId: newOwnerId }) => {
        if (cancelled) return;
        console.log('[Signal] webrtc:user-joined — I am CALLER for:', newPeerId, '|', displayName);
        if (newOwnerId) {
          setRoomOwnerId(newOwnerId);
        }
        // Store their name before creating PC so tiles show it correctly
        if (displayName) displayNamesRef.current.set(newPeerId, displayName);
        initialMediaStateRef.current.set(newPeerId, { audio: audio ?? true, video: video ?? true });
        if (peersRef.current.has(newPeerId)) {
          console.warn('[Signal] Already have PC for', newPeerId, '— skipping');
          return;
        }
        const pc = makePeerConnection(newPeerId, socket, 'camera');
        peersRef.current.set(newPeerId, pc);
        pendingIceRef.current.set(newPeerId, []);
        try {
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          console.log('[Signal] Sending offer to', newPeerId);
          socket.emit('webrtc:signal-send', {
            targetSocketId: newPeerId,
            signal: { type: 'offer', sdp: pc.localDescription.sdp, connectionType: 'camera' }
          });
        } catch (err) {
          console.error('[Signal] createOffer failed for', newPeerId, err);
        }
        // If I am already sharing my screen, initialize a screen PC for the new user!
        if (presentationStreamRef.current) {
          const screenPc = makePeerConnection(newPeerId, socket, 'screen');
          screenPeersRef.current.set(newPeerId, screenPc);
          screenPendingIceRef.current.set(newPeerId, []);
          try {
            const screenOffer = await screenPc.createOffer();
            await screenPc.setLocalDescription(screenOffer);
            socket.emit('webrtc:signal-send', {
              targetSocketId: newPeerId,
              signal: { type: 'offer', sdp: screenOffer.sdp, connectionType: 'screen' }
            });
          } catch (e) {
            console.error('[Signal] screen createOffer failed', e);
          }
        }
      });
      // ── webrtc:signal-receive ──────────────────────────────────────────
      socket.on('webrtc:signal-receive', async ({ fromSocketId, signal }) => {
        if (cancelled) return;
        console.log(`[Signal] Received ${signal.type} from ${fromSocketId}`);
        const type = signal.connectionType || 'camera';
        const isScreen = type === 'screen';
        const peersMap = isScreen ? screenPeersRef : peersRef;
        const iceMap = isScreen ? screenPendingIceRef : pendingIceRef;
        if (signal.type === 'offer') {
          // ── We are CALLEE — create PC now (never pre-created on callee side) ─
          let pc = peersMap.current.get(fromSocketId);
          if (pc) {
            console.warn(`[Signal] Received ${type} offer but PC already exists for`, fromSocketId, '— reusing');
          } else {
            pc = makePeerConnection(fromSocketId, socket, type);
            peersMap.current.set(fromSocketId, pc);
            if (!iceMap.current.has(fromSocketId)) {
              iceMap.current.set(fromSocketId, []);
            }
          }
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            await drainIce(fromSocketId, pc, isScreen);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log(`[Signal] Sending ${type} answer to`, fromSocketId);
            socket.emit('webrtc:signal-send', {
              targetSocketId: fromSocketId,
              signal: { type: 'answer', sdp: pc.localDescription.sdp, connectionType: type }
            });
          } catch (err) {
            console.error(`[Signal] Handle ${type} offer error from`, fromSocketId, err);
          }
        } else if (signal.type === 'answer') {
          // ── We are CALLER — set the remote answer ──────────────────────
          const pc = peersMap.current.get(fromSocketId);
          if (!pc) {
            console.warn(`[Signal] Got ${type} answer but no PC for`, fromSocketId);
            return;
          }
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            await drainIce(fromSocketId, pc, isScreen);
            console.log(`[Signal] ${type} Answer processed from`, fromSocketId);
          } catch (err) {
            console.error(`[Signal] Handle ${type} answer error from`, fromSocketId, err);
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          // ── ICE candidate ──────────────────────────────────────────────
          const pc = peersMap.current.get(fromSocketId);
          const ice = new RTCIceCandidate(signal.candidate);
          if (pc && pc.remoteDescription?.type) {
            // Remote description already set — apply immediately
            try { await pc.addIceCandidate(ice); }
            catch (e) { console.warn(`[ICE] ${type} addIceCandidate error:`, e); }
          } else {
            // Buffer until after setRemoteDescription
            console.log(`[ICE] Buffering ${type} candidate from ${fromSocketId}`);
            if (!iceMap.current.has(fromSocketId)) {
              iceMap.current.set(fromSocketId, []);
            }
            iceMap.current.get(fromSocketId).push(ice);
          }
        }
      });
      // ── webrtc:user-left ───────────────────────────────────────────────
      socket.on('webrtc:user-left', ({ socketId }) => {
        if (cancelled) return;
        console.log('[Signal] User left:', socketId);
        peersRef.current.get(socketId)?.close();
        peersRef.current.delete(socketId);
        pendingIceRef.current.delete(socketId);
        screenPeersRef.current.get(socketId)?.close();
        screenPeersRef.current.delete(socketId);
        screenPendingIceRef.current.delete(socketId);
        removeRemoteStream(socketId);
        // Cleanup any state tied to this user
        setScreenShareState(prev => {
          if (prev.isScreenSharing && prev.activeScreenSharerId === socketId) {
            return { activeScreenSharerId: null, activeScreenSharerName: null, isScreenSharing: false, type: null };
          }
          return prev;
        });
        setRaisedHands(prev => {
          if (prev.has(socketId)) {
            const next = new Set(prev);
            next.delete(socketId);
            return next;
          }
          return prev;
        });
        setMutedPeers(prev => {
          if (prev.has(socketId)) {
            const next = new Set(prev);
            next.delete(socketId);
            return next;
          }
          return prev;
        });
      });
      // ── 4. CONNECT — all handlers are registered ─────────────────────
      socket.connect();
    };
    init();
    // ── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      presentationStreamRef.current?.getTracks().forEach(t => t.stop());
      presentationStreamRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
      pendingIceRef.current.clear();
      screenPeersRef.current.forEach(pc => pc.close());
      screenPeersRef.current.clear();
      screenPendingIceRef.current.clear();
      remoteStreamsRef.current = [];
      initialMediaStateRef.current.clear();
      setRemoteStreams([]);
    };
  }, [roomId, initialMicMuted, initialVideoOn, makePeerConnection, drainIce, removeRemoteStream]);
  // ── Chat scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activePanel === 'chat') chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activePanel]);
  // ── Track toggles ─────────────────────────────────────────────────────────
  const toggleMic = () => {
    const next = !isMicMuted;
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !next; });
    setIsMicMuted(next);
    if (isOfflineRef.current) return;
    // Broadcast media state to others
    socketRef.current?.emit('toggle-media', { roomId, audio: !next, video: isVideoOn });
  };
  const toggleVideo = () => {
    const next = !isVideoOn;
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = next; });
    setIsVideoOn(next);
    if (isOfflineRef.current) return;
    // Broadcast media state to others
    socketRef.current?.emit('toggle-media', { roomId, audio: !isMicMuted, video: next });
  };
  // ── Hand Raise ────────────────────────────────────────────────────────────
  const toggleHandRaise = () => {
    const nextState = !isMyHandRaised;
    setIsMyHandRaised(nextState);
    if (isOfflineRef.current) return;
    socketRef.current?.emit('user:raise-hand', { roomId, isRaised: nextState });
  };
  // ── MODULE 1 & 2: Share modal click-outside ────────────────────────────
  useEffect(() => {
    const handleShareClickOutside = (event) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
        setShowShareModal(false);
      }
    };
    if (showShareModal) document.addEventListener('mousedown', handleShareClickOutside);
    return () => document.removeEventListener('mousedown', handleShareClickOutside);
  }, [showShareModal]);
  // ── MODULE 3: broadcastVideoTrack ──────────────────────────────────────
  const broadcastVideoTrack = useCallback((videoTrack, capturedStream, shareType) => {
    // FIX 1: Store the captured display stream so presenter view can show it
    if (capturedStream) {
      presentationStreamRef.current = capturedStream;
      setPresentationStream(capturedStream);
    }
    // Setup Parallel Screen Connections for all existing peers
    peersRef.current.forEach(async (cameraPc, peerId) => {
      try {
        // Create the dummy connection for this peer
        const screenPc = makePeerConnection(peerId, socketRef.current, 'screen');
        screenPeersRef.current.set(peerId, screenPc);
        screenPendingIceRef.current.set(peerId, []);
        // Manual renegotiation for the new screen track
        const offer = await screenPc.createOffer();
        await screenPc.setLocalDescription(offer);
        console.log(`[ScreenShare] Sending screen offer to '${peerId}'`);
        socketRef.current?.emit('webrtc:signal-send', {
          targetSocketId: peerId,
          signal: { type: 'offer', sdp: offer.sdp, connectionType: 'screen' }
        });
      } catch (err) {
        console.error(`[ScreenShare] Setup failed for '${peerId}':`, err);
      }
    });
    // UI Sync: emit layout state to all peers
    socketRef.current?.emit('SCREEN_SHARE_STARTED', {
      roomId,
      activeScreenSharerName: myDisplayNameRef.current,
      type: shareType
    });
    setScreenShareState({ 
      activeScreenSharerId: socketRef.current?.id, 
      activeScreenSharerName: myDisplayNameRef.current, 
      isScreenSharing: true, 
      type: shareType 
    });
    // Stop Sharing Listener: tear down screen connections cleanly
    videoTrack.onended = () => {
      console.log('[ScreenShare] Track ended — tearing down screen connections');
      // Close all parallel connections
      screenPeersRef.current.forEach((screenPc, peerId) => {
        screenPc.close();
      });
      screenPeersRef.current.clear();
      screenPendingIceRef.current.clear();
      // Clear presentation stream locally
      presentationStreamRef.current = null;
      setPresentationStream(null);
      socketRef.current?.emit('SCREEN_SHARE_STOPPED', {
        roomId
      });
      setScreenShareState({ activeScreenSharerId: null, activeScreenSharerName: null, isScreenSharing: false, type: null });
    };
  }, [roomId]);
  // ── MODULE 2: Dual routing functions ───────────────────────────────────
  const shareExternalScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        broadcastVideoTrack(videoTrack, stream, 'external');
      }
    } catch (err) {
      console.warn('[ScreenShare] External share cancelled or failed:', err);
    }
    setShowShareModal(false);
  }, [broadcastVideoTrack]);
  const shareNexusWorkspace = useCallback(async () => {
    try {
      // FIX 1: Force the browser to open before capturing
      setShowBrowser(true);
      // FIX 3: preferCurrentTab captures this browser tab (the Nexus workspace)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
        video: true,
        audio: false
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        // Broadcast the track and set state to 'internal' first
        broadcastVideoTrack(videoTrack, stream, 'internal');
        // Defer CropTarget so it targets the nexus-workspace-area INSIDE the Presenter View
        setTimeout(async () => {
          try {
            if (typeof CropTarget !== 'undefined' && videoTrack.cropTo) {
              const nexusEl = document.getElementById('nexus-workspace-area');
              if (nexusEl) {
                const target = await CropTarget.fromElement(nexusEl);
                await videoTrack.cropTo(target);
                console.log('[ScreenShare] CropTarget applied for nexus-workspace-area');
              }
            }
          } catch (cropErr) {
            console.warn('[ScreenShare] CropTarget not supported or failed:', cropErr);
          }
        }, 100);
      }
    } catch (err) {
      console.warn('[ScreenShare] Nexus share cancelled or failed:', err);
    }
    setShowShareModal(false);
  }, [broadcastVideoTrack]);
  // ── MODULE 3: Listen for remote sync-state from socket ─────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleScreenShareStarted = (state) => {
      console.log('[ScreenShare] Received SCREEN_SHARE_STARTED:', state);
      if (state) setScreenShareState(state);
    };
    const handleScreenShareStopped = () => {
      console.log('[ScreenShare] Received SCREEN_SHARE_STOPPED');
      setScreenShareState({ activeScreenSharerId: null, activeScreenSharerName: null, isScreenSharing: false, type: null });
    };
    const handleScreenShareTakenOver = ({ newSharerName }) => {
      console.warn(`[ScreenShare] Your screen share was taken over by ${newSharerName}`);
      // Forcefully stop our presentation stream
      if (presentationStreamRef.current) {
        presentationStreamRef.current.getTracks().forEach(t => t.stop());
        presentationStreamRef.current.getVideoTracks()[0]?.onended?.();
      }
      alert(`Your screen share was taken over by ${newSharerName}`);
    };
    socket.on('SCREEN_SHARE_STARTED', handleScreenShareStarted);
    socket.on('SCREEN_SHARE_STOPPED', handleScreenShareStopped);
    socket.on('SCREEN_SHARE_TAKEN_OVER', handleScreenShareTakenOver);
    return () => {
      socket.off('SCREEN_SHARE_STARTED', handleScreenShareStarted);
      socket.off('SCREEN_SHARE_STOPPED', handleScreenShareStopped);
      socket.off('SCREEN_SHARE_TAKEN_OVER', handleScreenShareTakenOver);
    };
  }, [localSocketId]); // re-bind when socket reconnects
  // ── Misc handlers ─────────────────────────────────────────────────────────
  const handleTogglePanel = p => setActivePanel(prev => prev === p ? 'none' : p);
  const handleToggleDocs = () => setShowDocsOverlay(p => !p);
  const handleExitRoom = () => navigate('/dashboard/home');
  const handleSendChatMessage = e => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    // Emit message to backend (it will be broadcasted back via chat:receive)
    socketRef.current?.emit('chat:send', {
      roomId,
      senderName: myDisplayNameRef.current,
      text: chatInput
    });
    setChatInput('');
  };
  // ── Derived ───────────────────────────────────────────────────────────────
  const totalParticipants = remoteStreams.length + 1;
  const galleryGridClass = `rd-grid-${Math.min(Math.max(totalParticipants, 1), 4)}`;
  const iAmHost = !!(localSocketId && roomOwnerId && localSocketId === roomOwnerId);
  // Local user's label — show their real name
  const localLabel = myDisplayName || 'You';
  // MODULE 1: Is the local user the one presenting?
  const isMePresenting = screenShareState.isScreenSharing && screenShareState.activeScreenSharerId === localSocketId;
  // Compute adaptive sidebar participants (excluding active presenter)
  // Compute adaptive sidebar participants
  const sidebarParticipants = [];
  // 1. Add local user (always in sidebar)
  if (localStream) {
    sidebarParticipants.push({
      id: 'local',
      stream: localStream,
      label: localLabel,
      isLocal: true,
      isHost: iAmHost,
      isVideoOn: isVideoOn,
      isMuted: isMicMuted,
      isHandRaised: isMyHandRaised
    });
  }
  // 2. Add remote users
  remoteStreams.forEach(peerObj => {
    sidebarParticipants.push({
      id: peerObj.socketId,
      // Since screenStream is now completely independent, camera stream remains fully active
      stream: peerObj.stream,
      label: peerObj.displayName || "Guest",
      isLocal: false,
      isHost: peerObj.socketId === roomOwnerId,
      // True camera state is unaffected by screen sharing
      isVideoOn: peerObj.video ?? true,
      isMuted: peerObj.audio === false || mutedPeers.has(peerObj.socketId),
      isHandRaised: raisedHands.has(peerObj.socketId)
    });
  });
  const MAX_SIDEBAR_TILES = 8;
  const showMoreTile = sidebarParticipants.length > MAX_SIDEBAR_TILES;
  const visibleSidebarParticipants = showMoreTile ? sidebarParticipants.slice(0, MAX_SIDEBAR_TILES - 1) : sidebarParticipants;
  const hiddenParticipantsCount = sidebarParticipants.length - visibleSidebarParticipants.length;
  const sidebarGridClass = (visibleSidebarParticipants.length + (showMoreTile ? 1 : 0)) >= 3 ? 'rd-sidebar-grid-2' : 'rd-sidebar-grid-1';
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rd-container" id="rd-container-root">
      {isOffline && <OfflineOverlay />}

      {/* Global Toast Notification for Copy Link */}
      <AnimatePresence>
        {linkCopied && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '0',
              left: '50%',
              zIndex: 9999,
              background: '#22c55e',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Check size={18} />
            Meeting Link Copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast Notification for Incoming Chat */}
      <AnimatePresence>
        {incomingChatToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 0 }}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '24px',
              zIndex: 9998,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '240px',
              maxWidth: '320px',
              cursor: 'pointer'
            }}
            onClick={() => {
               setIncomingChatToast(null);
               setActivePanel('chat');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0B5CFF', fontWeight: '600' }}>
               <MessageSquare size={14} />
               {incomingChatToast.senderName}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               {incomingChatToast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoomDocsOverlay roomId={roomId} onClose={() => setShowDocsOverlay(false)} isVisible={showDocsOverlay} />
      <div className="rd-content-wrapper">
        <div className={`rd-workspace ${activePanel !== 'none' ? 'rd-workspace-shrunk' : ''} ${isBrowserFullscreen ? 'is-browser-fullscreen' : ''}`}>
          <div className="rd-workspace-content">
            {/* ONLY show this top-level browser if NOT presenting internally */}
            {!(isMePresenting && screenShareState.type === 'internal') && (
              <div className="rd-browser-wrapper" style={{ display: showBrowser ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
                {showBrowser && (
                  <VirtualBrowser roomId={roomId} onClose={() => setShowBrowser(false)}
                    isFullscreen={isBrowserFullscreen} onToggleFullscreen={() => setIsBrowserFullscreen(p => !p)} />
                )}
              </div>
            )}
            {/* ── Dynamic Grid — Gallery / Participant-Spotlight / Presenter-PiP ── */}
            {!screenShareState.isScreenSharing ? (
              /* ── 1. GALLERY VIEW — no one is sharing ──────────────────── */
              <div className={showBrowser ? 'rd-col-b rd-video-stack' : `rd-col-a rd-gallery-layout rd-video-grid ${galleryGridClass}`}>
                <VideoTile stream={localStream} isLocal isHost={iAmHost} isVideoOn={isVideoOn} label={localLabel} identifier="local" isMuted={isMicMuted} isHandRaised={isMyHandRaised} isSpeaking={isMeSpeaking} />
                {remoteStreams.map(({ socketId, stream, displayName, audio, video, isSpeaking }) => (
                  <VideoTile key={socketId} stream={stream} isLocal={false}
                    isHost={socketId === roomOwnerId} isVideoOn={video ?? true} label={displayName || 'Guest'} identifier={socketId} isMuted={audio === false || mutedPeers.has(socketId)} isHandRaised={raisedHands.has(socketId)} isSpeaking={isSpeaking} />
                ))}
              </div>
            ) : (
              /* ── 2. SPOTLIGHT VIEW — active screen share (Unified for Presenter & Viewers) ── */
              <div className="rd-col-a rd-spotlight-layout">
                {/* Main viewport — shared screen */}
                <div className="rd-spotlight-main">
                  {(() => {
                    const activeScreenPresenter = remoteStreams.find(p => p.screenStream !== null) || (presentationStream ? { isLocal: true, stream: presentationStream, socketId: localSocketId, displayName: localLabel } : null);
                    return <SharedScreenPresentationArea 
                      activeScreenPresenter={activeScreenPresenter}
                      sharedScreenInfo={{ isActive: screenShareState.isScreenSharing, hostSocketId: screenShareState.activeScreenSharerId, type: screenShareState.type }}
                      roomId={roomId}
                      showBrowser={showBrowser}
                      setShowBrowser={setShowBrowser}
                      isBrowserFullscreen={isBrowserFullscreen}
                      setIsBrowserFullscreen={setIsBrowserFullscreen}
                      showDocsOverlay={showDocsOverlay}
                      setShowDocsOverlay={setShowDocsOverlay}
                      iAmHost={iAmHost}
                      isMicMuted={isMicMuted}
                      isMyHandRaised={isMyHandRaised}
                      roomOwnerId={roomOwnerId}
                      mutedPeers={mutedPeers}
                      raisedHands={raisedHands}
                    />;
                  })()}
                </div>
                {/* Adaptive Participants Sidebar */}
                <div className="rd-spotlight-sidebar">
                  <ParticipantVerticalSidebar visibleSidebarParticipants={visibleSidebarParticipants} isMeSpeaking={isMeSpeaking} />
                  {showMoreTile && (
                    <div 
                      className="rd-sidebar-tile-wrapper rd-more-tile" 
                      onClick={() => handleTogglePanel('people')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="rd-more-tile-content">
                        +{hiddenParticipantsCount} More
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="rd-toolbar">
            <div className="rd-toolbar-group">
              <button className="rd-toolbar-btn" onClick={toggleMic}>
                {isMicMuted ? <MicOff size={20} style={{ color: 'var(--rd-alert-red)' }} /> : <Mic size={20} />}
                <span>Audio</span>
              </button>
              <button className="rd-toolbar-btn" onClick={toggleVideo}>
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} style={{ color: 'var(--rd-alert-red)' }} />}
                <span>Video</span>
              </button>
            </div>
            <div className="rd-toolbar-group">
              <button className={`rd-toolbar-btn ${activePanel === 'people' ? 'rd-active' : ''}`} onClick={() => handleTogglePanel('people')}>
                <Users size={20} /><span>People ({totalParticipants})</span>
              </button>
              <button className={`rd-toolbar-btn ${activePanel === 'chat' ? 'rd-active' : ''}`} onClick={() => handleTogglePanel('chat')}>
                <MessageSquare size={20} /><span>Chat</span>
              </button>
              <button className={`rd-toolbar-btn ${isMyHandRaised ? 'rd-active' : ''}`} onClick={toggleHandRaise}>
                <Hand size={20} style={{ color: isMyHandRaised ? '#fbbc04' : 'inherit' }} /><span>Raise hand</span>
              </button>
              <div className="rd-share-modal-anchor" ref={shareModalRef}>
                <button 
                  className={`rd-toolbar-btn ${screenShareState.isScreenSharing && screenShareState.activeScreenSharerId === localSocketId ? 'rd-sharing-active' : ''}`} 
                  disabled={screenShareState.isScreenSharing && screenShareState.activeScreenSharerId !== localSocketId}
                  style={{ 
                    opacity: screenShareState.isScreenSharing && screenShareState.activeScreenSharerId !== localSocketId ? 0.5 : 1, 
                    cursor: screenShareState.isScreenSharing && screenShareState.activeScreenSharerId !== localSocketId ? 'not-allowed' : 'pointer' 
                  }}
                  onClick={() => {
                    const isMeSharing = screenShareState.isScreenSharing && screenShareState.activeScreenSharerId === localSocketId;
                    const isSomeoneElseSharing = screenShareState.isScreenSharing && screenShareState.activeScreenSharerId !== localSocketId;
                    if (isSomeoneElseSharing) return;
                    if (isMeSharing) {
                      // Stop sharing manually
                      if (presentationStreamRef.current) {
                        presentationStreamRef.current.getTracks().forEach(t => t.stop());
                        presentationStreamRef.current.getVideoTracks()[0]?.onended?.();
                      }
                    } else {
                      // Host sees modal, participants directly trigger getDisplayMedia
                      if (iAmHost) {
                        setShowShareModal(v => !v);
                      } else {
                        shareExternalScreen();
                      }
                    }
                  }}
                >
                  <ArrowUp size={20} style={{ color: '#22c55e' }} />
                  <span>
                    {screenShareState.isScreenSharing && screenShareState.activeScreenSharerId === localSocketId 
                      ? 'Stop Share' 
                      : 'Share'}
                  </span>
                </button>
                <AnimatePresence>
                  {showShareModal && (
                    <motion.div
                      className="rd-share-modal"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button className="rd-share-option" onClick={() => {
                        shareExternalScreen();
                      }}>
                        <Monitor size={18} className="rd-share-icon" />
                        <span>Share External Screen</span>
                      </button>
                      {iAmHost && (
                        <button className="rd-share-option" onClick={() => {
                          shareNexusWorkspace();
                        }}>
                          <ScreenShare size={18} className="rd-share-icon" />
                          <span>Share Nexus Browser</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {iAmHost && (
                <button className={`rd-toolbar-btn ${showBrowser ? 'rd-active' : ''}`} onClick={() => setShowBrowser(v => !v)}>
                  <Globe size={20} /><span>Browser</span>
                </button>
              )}
              <button className={`rd-toolbar-btn ${showDocsOverlay ? 'rd-active' : ''}`} onClick={handleToggleDocs}>
                <FileText size={20} /><span>Docs</span>
              </button>
              <button className={`rd-toolbar-btn ${activePanel === 'ai' ? 'rd-active' : ''}`} onClick={() => handleTogglePanel('ai')}>
                <Sparkles size={20} /><span>AI</span>
              </button>
              {/* More Options Dropdown */}
              <div className="rd-more-menu-container" ref={moreMenuRef} style={{ position: 'relative', display: 'flex' }}>
                <button className={`rd-toolbar-btn ${showMoreMenu ? 'rd-active' : ''}`} onClick={() => setShowMoreMenu(!showMoreMenu)}>
                  <MoreVertical size={20} /><span>More</span>
                </button>
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="rd-more-dropdown" 
                      style={{ 
                        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
                        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', borderRadius: '8px',
                        padding: '8px 0', minWidth: '180px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)', zIndex: 50, color: '#fff'
                      }}>
                      <button className="rd-dropdown-item" onClick={() => { 
                        setIsFullscreen(!isFullscreen);
                        if (!isFullscreen) document.documentElement.requestFullscreen().catch(()=>console.warn('Fullscreen blocked'));
                        else document.exitFullscreen().catch(()=>console.warn('Exit fullscreen blocked'));
                        setShowMoreMenu(false);
                      }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', gap: '12px' }}>
                        <Maximize size={18} /><span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="rd-toolbar-group">
              <button className="rd-toolbar-btn rd-danger" onClick={handleExitRoom}>
                <X size={20} /><span>Leave</span>
              </button>
            </div>
          </div>
        </div>
        <div className={`rd-side-panel ${activePanel === 'none' ? 'rd-side-panel-hidden' : ''}`}>
          <div className="rd-panel-header">
            <span className="rd-panel-title">
              {activePanel === 'chat' ? 'Room Chat' : activePanel === 'people' ? 'People' : 'AI Assistant'}
            </span>
            <button className="rd-panel-close-btn" onClick={() => setActivePanel('none')}><X size={16} /></button>
          </div>
          <div className={`rd-panel-body ${activePanel === 'ai' ? 'rd-panel-body-ai' : ''}`}>
            {activePanel === 'chat' && (
              <>
                <div className="rd-chat-messages">
                  {chatMessages.length === 0
                    ? <div className="rd-empty-state"><MessageSquare size={32} strokeWidth={1.5} /><span>No messages yet.</span></div>
                    : chatMessages.map(msg => (
                      <div key={msg.id} className={`rd-chat-bubble ${msg.senderName === localLabel ? 'rd-self' : ''}`}>
                        <div className="rd-bubble-meta">{msg.senderName} · {msg.time}</div>
                        <div className="rd-bubble-content">{msg.text}</div>
                      </div>
                    ))}
                  <div ref={chatBottomRef} />
                </div>
                <form className="rd-chat-input-wrapper" onSubmit={handleSendChatMessage}>
                  <input type="text" className="rd-input-field" placeholder="Type a message…"
                    value={chatInput} onChange={e => setChatInput(e.target.value)} />
                  <button type="submit" className="rd-send-btn"><Send size={14} /></button>
                </form>
              </>
            )}
            {activePanel === 'people' && (
              <div className="rd-people-panel">
                <button className="rd-add-people-btn" onClick={handleCopyInviteLink}>
                  {linkCopied ? <Check size={16} style={{ color: '#22c55e' }} /> : <Link size={16} />}
                  <span>{linkCopied ? 'Link copied!' : 'Copy meeting link'}</span>
                </button>
                <div className="rd-people-section">
                  <div className="rd-people-section-header">
                    <span>Contributors</span><span className="rd-people-count">{totalParticipants}</span>
                  </div>
                  <div className="rd-people-list">
                    <div className="rd-person-item">
                      <div className="rd-person-avatar"><div className="rd-avatar-placeholder">{localLabel.charAt(0).toUpperCase()}</div></div>
                      <div className="rd-person-info">
                        <div className="rd-person-name">{localLabel} <span className="rd-person-you">(You)</span></div>
                        {iAmHost && <div className="rd-person-role">Meeting host</div>}
                      </div>
                      <button className="rd-person-action"><MoreVertical size={16} /></button>
                    </div>
                    {remoteStreams.map((rs) => (
                      <div className="rd-person-item" key={rs.socketId}>
                        <div className="rd-person-avatar"><div className="rd-avatar-placeholder">{(rs.displayName || 'G').charAt(0).toUpperCase()}</div></div>
                        <div className="rd-person-info">
                          <div className="rd-person-name">{rs.displayName || 'Guest'}</div>
                          <div className="rd-person-role">{rs.socketId === roomOwnerId ? 'Meeting host' : 'Participant'}</div>
                        </div>
                        <button className="rd-person-action"><MoreVertical size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: activePanel === 'ai' ? 'block' : 'none', height: '100%' }}>
              <RoomChatPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoomDashboard;