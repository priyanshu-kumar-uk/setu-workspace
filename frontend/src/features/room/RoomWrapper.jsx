import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RoomLobby from './RoomLobby';
import RoomDashboard from './RoomDashboard';
import { useLoading } from '../../context/LoadingContext';
const RoomWrapper = () => {
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaPreferences, setMediaPreferences] = useState({
    isMicMuted: false,
    isCameraOn: true
  });
  const { startLoading } = useLoading();
  const handleJoin = (prefs) => {
    startLoading('MEETING');
    setMediaPreferences(prefs);
    setHasJoined(true);
  };
  if (!hasJoined) {
    return <RoomLobby roomId={roomId} onJoin={handleJoin} />;
  }
  return (
    <RoomDashboard 
      initialMicMuted={mediaPreferences.isMicMuted} 
      initialVideoOn={mediaPreferences.isCameraOn} 
    />
  );
};
export default RoomWrapper;
