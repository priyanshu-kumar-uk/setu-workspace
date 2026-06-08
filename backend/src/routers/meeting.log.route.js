import { Router } from "express";
import { getMeetingsHistory, deleteMeetingHistory } from "../controllers/meeting.log.controller.js";
import { verifedUser } from "../middlewares/userVerify.js";
const router = Router();
router.get("/history", verifedUser, getMeetingsHistory);
router.delete("/history/:id", verifedUser, deleteMeetingHistory);
export default router;
