import express from 'express'
import cookie from 'cookie-parser'
import userRouter from './routers/auth.user.route.js'
import globleError from './middlewares/globle.error.js'
import morgan from 'morgan'
import cors from 'cors'
import aiRouter from './routers/ai.route.js'
import docsRouter from './routers/docs.route.js'
import meetingRouter from './routers/meeting.log.route.js'
import scheduledMeetingRouter from './routers/scheduled.meeting.route.js'
import { startNotificationCron } from './services/notification.service.js'
const app = express()
startNotificationCron(); 
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
app.use(cors(corsOptions))
app.use(morgan("dev"))
app.use(express.json())
app.use(cookie())
app.use("/api/auth", userRouter)
app.use("/api",aiRouter) 
app.use("/api/docs", docsRouter)
app.use("/api/meetings", meetingRouter)
app.use("/api/meetings/schedule", scheduledMeetingRouter)
app.get("/api/test-sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.write(": connected\n\n");
  let i = 0;
  const iv = setInterval(() => {
    i++;
    res.write(`data: {"token":"word${i}"}\n\n`);
    console.log("[TEST-SSE] sent word", i);
    if (i >= 5) { 
      res.write(`data: {"done":true}\n\n`);
      res.end(); 
      clearInterval(iv); 
    }
  }, 300);
  req.on("close", () => { clearInterval(iv); console.log("[TEST-SSE] client closed"); });
});
app.use(globleError)
export default app