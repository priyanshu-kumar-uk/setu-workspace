import { ApiResponse } from '../utils/api.res.js';
import { asyncHandler } from '../utils/asynchandlar.js';
import MeetingLog from '../models/meeting.log.model.js';
export const getMeetingsHistory = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const query = {
        userId: userId,
        $or: [
            { endTime: { $ne: null } },
            { endTime: null, startTime: { $lt: twoHoursAgo } }
        ]
    };
    const totalLogs = await MeetingLog.countDocuments(query);
    const logs = await MeetingLog.find(query)
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    const totalPages = Math.ceil(totalLogs / limit);
    return res.status(200).json(new ApiResponse(200, {
        logs,
        pagination: {
            currentPage: page,
            totalPages,
            totalLogs
        }
    }, "Meeting history fetched successfully"));
});
export const deleteMeetingHistory = asyncHandler(async function (req, res) {
    const meetingId = req.params.id;
    const userId = req.user.id;
    if (!meetingId) {
        return res.status(400).json(new ApiResponse(400, null, "Meeting ID is required"));
    }
    const result = await MeetingLog.deleteOne({ _id: meetingId, userId: userId });
    if (result.deletedCount === 0) {
        return res.status(404).json(new ApiResponse(404, null, "Meeting not found or unauthorized"));
    }
    return res.status(200).json(new ApiResponse(200, null, "Meeting permanently deleted from database"));
});
