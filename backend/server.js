import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './src/app.js'
import config from './src/config/config.js'
import dbconnect from './src/config/database.js'
import { initBrowserSocket } from './src/services/browser.socket.js'
import { initRoomSocket } from './src/services/room.socket.js'

dbconnect()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        config.FRONTEND_URL, 
        'http://localhost:5173',
        'http://localhost:3000'
      ];

      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 5e6, 
})

initBrowserSocket(io)
initRoomSocket(io)

httpServer.listen(config.PORT, () => {
  console.log('Server is Running  Port', config.PORT)
})