import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import './RoomLobby.css';
const RoomLobby = ({ roomId, onJoin }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setIsCameraOn(false);
        setIsMicMuted(true);
      }
    };
    getMedia();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted; 
      });
    }
    setIsMicMuted(!isMicMuted);
  };
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn; 
      });
    }
    setIsCameraOn(!isCameraOn);
  };
  const handleJoin = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onJoin({ isMicMuted, isCameraOn });
  };
  const roomUrl = `${window.location.origin}/room/${roomId}`;
  return (
    <div className="lobby-container">
      <div className="lobby-content">
        <div className="lobby-preview-card">
          <div className="lobby-video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`lobby-video ${!isCameraOn ? 'hidden' : ''}`}
            />
            {!isCameraOn && (
              <div className="lobby-video-off-state">
                <VideoOff size={48} />
                <p>Camera is off</p>
              </div>
            )}
            <div className="lobby-controls">
              <button
                className={`lobby-ctrl-btn ${isMicMuted ? 'danger' : ''}`}
                onClick={toggleMic}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                className={`lobby-ctrl-btn ${!isCameraOn ? 'danger' : ''}`}
                onClick={toggleCamera}
                title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {!isCameraOn ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
            </div>
          </div>
        </div>
        <div className="lobby-info-card">
          <h1 className="lobby-greeting">Ready to join?</h1>
          <p className="lobby-subtitle">No one else is here</p>
          <div className="lobby-link-box">
            <span className="lobby-link-label">Meeting link</span>
            <input 
              type="text" 
              readOnly 
              value={roomUrl} 
              className="lobby-link-input"
            />
          </div>
          <button className="lobby-join-btn" onClick={handleJoin}>
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
};
export default RoomLobby;
