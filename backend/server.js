import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './src/app.js'
import config from './src/config/config.js'
import dbconnect from './src/config/database.js'
import { initBrowserSocket } from './src/services/browser.socket.js'

dbconnect()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 5e6, // 5MB — enough for JPEG screenshot frames
})

initBrowserSocket(io)

httpServer.listen(config.PORT, () => {
  console.log('Server is Running  Port', config.PORT)
})