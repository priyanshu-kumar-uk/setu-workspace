import mongoose, { Schema } from 'mongoose';
const scheduledMeetingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    hostId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    roomId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    durationInMinutes: {
        type: Number,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    },
    invitedEmails: {
        type: [String],
        default: []
    },
    notificationSent: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });
scheduledMeetingSchema.index({ hostId: 1, scheduledTime: 1 });
scheduledMeetingSchema.index({ notificationSent: 1, scheduledTime: 1 });
scheduledMeetingSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const ScheduledMeeting = mongoose.model('ScheduledMeeting', scheduledMeetingSchema);
export default ScheduledMeeting;
