import mongoose, { Schema } from 'mongoose';
const meetingLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        default: 'Workspace Session'
    },
    description: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        required: true,
        enum: ['Host', 'Participant']
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    durationInMinutes: {
        type: Number,
        default: 0
    },
    participants: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },
        displayName: {
            type: String,
            required: true
        },
        socketId: {
            type: String,
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        leftAt: {
            type: Date,
            default: null
        }
    }]
});
meetingLogSchema.index({ userId: 1, startTime: -1 });
const MeetingLog = mongoose.model('MeetingLog', meetingLogSchema);
export default MeetingLog;
