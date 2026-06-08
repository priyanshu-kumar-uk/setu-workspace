import ScheduledMeeting from '../models/scheduled.meeting.model.js';
import { transporter } from '../utils/mailer.js';
import config from '../config/config.js';
export const startNotificationCron = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            const targetThreshold = new Date(now.getTime() + 2 * 60000);
            const meetingsToNotify = await ScheduledMeeting.find({
                notificationSent: false,
                scheduledTime: { $lte: targetThreshold }
            }).populate('hostId', 'email firstname lastname');
            for (const meeting of meetingsToNotify) {
                const host = meeting.hostId;
                if (!host) continue;
                meeting.notificationSent = true;
                await meeting.save();
                const recipients = new Set([...meeting.invitedEmails]);
                if (host.email) {
                    recipients.add(host.email);
                }
                if (recipients.size === 0) continue;
                const hostName = `${host.firstname} ${host.lastname}`.trim();
                const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${meeting.roomId}`;
                const mailOptions = {
                    from: config.APP_EMAIL,
                    to: Array.from(recipients).join(','),
                    subject: `Meeting Reminder: ${meeting.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            <h2 style="color: #0B5CFF;">Meeting Reminder</h2>
                            <p style="color: #0f172a; font-size: 16px;">Hello,</p>
                            <p style="color: #0f172a; font-size: 16px;">This is a reminder that the meeting <strong>"${meeting.title}"</strong> hosted by <strong>${hostName}</strong> is starting soon.</p>
                            <p style="font-size: 16px; margin-top: 30px;">
                                <a href="${meetingLink}" style="background-color: #0B5CFF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Join Meeting Now
                                </a>
                            </p>
                            <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="${meetingLink}" style="color: #0B5CFF;">${meetingLink}</a>
                            </p>
                        </div>
                    `
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(`[Notification Service] Failed to send email for meeting ${meeting.roomId}:`, error);
                    } else {
                        console.log(`[Notification Service] Email sent successfully for meeting ${meeting.roomId} to ${mailOptions.to}`);
                    }
                });
            }
        } catch (error) {
            console.error('[Notification Service] Error in cron worker:', error);
        }
    }, 60000);
};
