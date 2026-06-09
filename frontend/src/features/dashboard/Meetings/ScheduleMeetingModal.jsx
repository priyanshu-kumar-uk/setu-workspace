import React, { useState } from 'react';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';
import { useScheduleMeeting } from './hooks/api.hooks';
import './ScheduleMeetingModal.css';
const ScheduleMeetingModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [durationInMinutes, setDurationInMinutes] = useState(30);
    const [emailInput, setEmailInput] = useState('');
    const [invitedEmails, setInvitedEmails] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const scheduleMutation = useScheduleMeeting();
    if (!isOpen) return null;
    const handleAddEmail = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const email = emailInput.trim();
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !invitedEmails.includes(email)) {
                setInvitedEmails([...invitedEmails, email]);
                setEmailInput('');
            }
        }
    };
    const handleRemoveEmail = (emailToRemove) => {
        setInvitedEmails(invitedEmails.filter(e => e !== emailToRemove));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        const scheduledTime = new Date(`${date}T${time}`);
        try {
            await scheduleMutation.mutateAsync({
                title,
                scheduledTime: scheduledTime.toISOString(),
                durationInMinutes: Number(durationInMinutes),
                invitedEmails
            });
            onClose(); 
        } catch (error) {
            console.error('Failed to schedule meeting:', error);
            setErrorMsg(error.response?.data?.message || 'Failed to schedule meeting. Please check the date and time.');
        }
    };
    return (
        <div className="smm-overlay">
            <div className="smm-modal">
                <div className="smm-header">
                    <h2>Schedule Meeting</h2>
                    <button className="smm-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                {errorMsg && <div className="smm-error-msg" style={{ color: 'red', margin: '10px 20px', fontSize: '0.9rem', padding: '8px', background: '#ffebee', borderRadius: '4px' }}>{errorMsg}</div>}
                <form className="smm-form" onSubmit={handleSubmit}>
                    <div className="smm-form-group">
                        <label>Title</label>
                        <div className="smm-input-wrapper">
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g., Weekly Sync" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="smm-form-row">
                        <div className="smm-form-group">
                            <label>Date</label>
                            <div className="smm-input-wrapper">
                                <Calendar size={18} className="smm-icon" />
                                <input 
                                    type="date" 
                                    required 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="smm-form-group">
                            <label>Time</label>
                            <div className="smm-input-wrapper">
                                <Clock size={18} className="smm-icon" />
                                <input 
                                    type="time" 
                                    required 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="smm-form-group">
                        <label>Duration (minutes)</label>
                        <div className="smm-input-wrapper">
                            <input 
                                type="number" 
                                min="1" 
                                required 
                                value={durationInMinutes}
                                onChange={(e) => setDurationInMinutes(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="smm-form-group">
                        <label>Invited Emails (Optional, Press Enter to add)</label>
                        <div className="smm-input-wrapper smm-email-wrapper">
                            <Users size={18} className="smm-icon" />
                            <div className="smm-chips-container">
                                {invitedEmails.map((email) => (
                                    <div key={email} className="smm-chip">
                                        <span>{email}</span>
                                        <button type="button" onClick={() => handleRemoveEmail(email)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <input 
                                    type="email" 
                                    placeholder="Enter participant email..." 
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleAddEmail}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="smm-footer">
                        <button type="button" className="smm-btn-cancel" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className="smm-btn-submit" 
                            disabled={scheduleMutation.isPending}
                        >
                            {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ScheduleMeetingModal;
