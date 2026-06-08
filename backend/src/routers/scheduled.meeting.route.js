import { Router } from "express";
import { createScheduledMeeting, getUpcomingMeetings } from "../controllers/scheduled.meeting.controller.js";
import { verifedUser } from "../middlewares/userVerify.js";
const router = Router();
router.post("/", verifedUser, createScheduledMeeting);
router.get("/upcoming", verifedUser, getUpcomingMeetings);
export default router;
