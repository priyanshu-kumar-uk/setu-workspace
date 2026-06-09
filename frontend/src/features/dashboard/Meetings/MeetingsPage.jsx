import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, ChevronDown, ChevronUp, Users, Trash2 } from 'lucide-react';
import JoinPopover from '../../../components/JoinPopover';
import { authGetme } from '../../auth/hooks/api.hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useMeetingHistory, useUpcomingMeetings, useDeleteMeetingHistory } from './hooks/api.hooks';
import { SkeletonList } from '../../../components/ui/Skeletons/Skeleton';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import './MeetingsPage.css';
const TABS = ['History', 'Upcoming'];
const generateRoomId = () => {
  const arr = new Uint8Array(10);
  window.crypto.getRandomValues(arr);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const s = Array.from(arr, b => chars[b % chars.length]).join('');
  return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7, 10)}`;
};
const MeetingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('History');
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const { data: meData } = authGetme();
  const currentUserId = meData?.data?._id;
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useMeetingHistory();
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingMeetings();
  const deleteMutation = useDeleteMeetingHistory();
  const [localHistoryLogs, setLocalHistoryLogs] = useState([]);
  useEffect(() => {
    if (historyData?.data) {
      setLocalHistoryLogs(Array.isArray(historyData.data) ? historyData.data : historyData.data.logs || []);
    }
  }, [historyData]);
  useEffect(() => {
    if (activeTab === 'History') {
      refetchHistory();
    }
  }, [activeTab, refetchHistory]);
  const upcomingLogs = upcomingData?.data || [];
  const totalSessions = localHistoryLogs.length;
  const sessionsHosted = localHistoryLogs.filter(log => log.role === 'Host').length;
  const totalHours = (localHistoryLogs.reduce((acc, log) => acc + (log.durationInMinutes || 0), 0) / 60).toFixed(1);
  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    setLocalHistoryLogs(prev => prev.filter(log => log._id !== id));
    if (expandedLogId === id) setExpandedLogId(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete history record", err);
      if (historyData?.data) {
        setLocalHistoryLogs(Array.isArray(historyData.data) ? historyData.data : historyData.data.logs || []);
      }
    }
  };
  return (
    <div className="meetings-page">
      <div className="meetings-header">
        <h1 className="meetings-page-title">Meetings</h1>
        <div className="meetings-header-actions">
          <button 
            className="meetings-btn-outline" 
            id="meetings-btn-schedule"
            onClick={() => setShowScheduleModal(true)}
          >
            <Calendar size={16} />
            Schedule
          </button>
          <button 
            className="meetings-btn-primary" 
            id="meetings-btn-new"
            onClick={() => navigate(`/room/${generateRoomId()}`)}
          >
            <Video size={16} />
            New Meeting
          </button>
        </div>
      </div>
      <div className="meetings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`meetings-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'History' ? (
        <div className="mh-history-view">
          <div className="mh-analytics-row">
            <div className="mh-stat-card">
              <div className="mh-stat-title">Total Sessions</div>
              <div className="mh-stat-value">{totalSessions}</div>
            </div>
            <div className="mh-stat-card" style={{ background: '#0B5CFF' }}>
              <div className="mh-stat-title" style={{ color: '#e8f0fe' }}>Sessions Hosted</div>
              <div className="mh-stat-value">{sessionsHosted}</div>
            </div>
            <div className="mh-stat-card">
              <div className="mh-stat-title">Collaboration Hours</div>
              <div className="mh-stat-value">{totalHours}h</div>
            </div>
          </div>
          <div className="mh-history-table-container">
            {historyLoading ? (
              <div style={{ padding: '24px' }}>
                <SkeletonList count={5} />
              </div>
            ) : localHistoryLogs.length === 0 ? (
              <div className="mh-empty">No meeting history found.</div>
            ) : (
              <table className="mh-history-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Headcount</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {localHistoryLogs.map(log => {
                    const isHost = log.role === 'Host';
                    const headcount = new Set(log.participants.map(p => p.userId || p.displayName)).size;
                    const isExpanded = expandedLogId === log._id;
                    const displayTitle = log.title ? log.title : log.roomId;
                    return (
                      <React.Fragment key={log._id}>
                        <tr className="mh-table-row" onClick={() => setExpandedLogId(isExpanded ? null : log._id)}>
                          <td style={{ fontWeight: 600 }}>{displayTitle}</td>
                          <td>{new Date(log.startTime).toLocaleString()}</td>
                          <td>{log.durationInMinutes} mins</td>
                          <td>{headcount}</td>
                          <td>
                            <span className={isHost ? 'mh-role-badge-host' : 'mh-role-badge-participant'}>
                              {isHost ? 'Host' : 'Participant'}
                            </span>
                          </td>
                          <td className="mh-table-actions">
                            <button className="mh-btn-delete" onClick={(e) => handleDeleteHistory(e, log._id)}>
                              <Trash2 size={16} />
                            </button>
                            {isExpanded ? <ChevronUp size={16} className="mh-chevron" /> : <ChevronDown size={16} className="mh-chevron" />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="mh-accordion-row">
                            <td colSpan="6">
                              <div className="mh-accordion-panel">
                                <h4>Participant Log</h4>
                                <table className="mh-sub-table">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Joined At</th>
                                      <th>Left At</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {log.participants.map((p, i) => (
                                      <tr key={i}>
                                        <td>{p.displayName}</td>
                                        <td>{new Date(p.joinedAt).toLocaleTimeString()}</td>
                                        <td>{p.leftAt ? new Date(p.leftAt).toLocaleTimeString() : 'Active'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="mh-upcoming-view">
          <div className="mh-history-table-container">
            {upcomingLoading ? (
              <div style={{ padding: '24px' }}>
                <SkeletonList count={3} />
              </div>
            ) : upcomingLogs.length === 0 ? (
              <div className="mh-empty">No upcoming meetings scheduled.</div>
            ) : (
              <table className="mh-history-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Room ID</th>
                    <th>Scheduled For</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingLogs.map(log => (
                    <tr key={log._id} className="mh-table-row">
                      <td style={{ fontWeight: 600 }}>{log.title}</td>
                      <td>{log.roomId}</td>
                      <td>{new Date(log.scheduledTime).toLocaleString()}</td>
                      <td>{log.durationInMinutes} mins</td>
                      <td>
                        <button 
                          className="meetings-btn-primary" 
                          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                          onClick={() => navigate(`/room/${log.roomId}`)}
                        >
                          Join
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {showJoinPopup && (
        <JoinPopover 
          onClose={() => setShowJoinPopup(false)}
          onJoin={(id) => navigate(`/room/${id}`)}
        />
      )}
      <ScheduleMeetingModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
      />
    </div>
  );
};
export default MeetingsPage;
