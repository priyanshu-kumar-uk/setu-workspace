import { ApiResponse } from '../utils/api.res.js';
import { asyncHandler } from '../utils/asynchandlar.js';
import ScheduledMeeting from '../models/scheduled.meeting.model.js';
import crypto from 'crypto';
const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(10);
    for (let i = 0; i < 10; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return `${result.slice(0, 3)}-${result.slice(3, 7)}-${result.slice(7, 10)}`;
};
export const createScheduledMeeting = asyncHandler(async function (req, res) {
    const { title, scheduledTime, durationInMinutes, invitedEmails } = req.body;
    const userId = req.user.id;
    if (!title || !scheduledTime || !durationInMinutes) {
        return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
    }
    const roomId = generateMeetingId();
    const parsedScheduledTime = new Date(scheduledTime);
    const expireAt = new Date(parsedScheduledTime.getTime() + Number(durationInMinutes) * 60000);
    
    if (expireAt <= new Date()) {
        return res.status(400).json(new ApiResponse(400, null, "Meeting time has already passed. Please select a future time."));
    }
    const newMeeting = await ScheduledMeeting.create({
        title,
        hostId: userId,
        roomId,
        scheduledTime: parsedScheduledTime,
        durationInMinutes: Number(durationInMinutes),
        expireAt,
        invitedEmails: Array.isArray(invitedEmails) ? invitedEmails : []
    });
    return res.status(201).json(new ApiResponse(201, newMeeting, "Meeting scheduled successfully"));
});
export const getUpcomingMeetings = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const upcomingMeetings = await ScheduledMeeting.find({
        hostId: userId,
        expireAt: { $gt: new Date() }
    })
    .sort({ scheduledTime: 1 })
    .lean();
    return res.status(200).json(new ApiResponse(200, upcomingMeetings, "Upcoming meetings fetched successfully"));
});
