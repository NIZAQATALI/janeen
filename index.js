//  import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import userRoute from './routes/users.js';
// import authRoute from './routes/auth.js';
// import { createServer } from "http";
// import { Server } from "socket.io";


// dotenv.config({ path: './config.env' });
// const app = express();
// const portNo = process.env.PORT || 8000;

// // CORS setup
// const corsOptions = {
//   origin: true,
//   credentials: true,
// };
// // Middlewares
// app.use(express.json());
// app.use(cors(corsOptions));
// app.use(cookieParser());
// // Routes
// app.get('/', (req, res) => {
//   res.send('API working successfully');
// });
// app.get('/db-check', (req, res) => {
//   const isConnected = mongoose.connection.readyState === 1;
//   res.status(isConnected ? 200 : 500).json({
//     connected: isConnected,
//     message: isConnected
//       ? '✅ MongoDB is connected!'
//       : '❌ MongoDB is NOT connected.',
//   });
// });

// app.use('/api/v1/auth', authRoute);
// app.use('/api/v1/users', userRoute);

// // MongoDB and server startup
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ MongoDB Database Connected Successfully');

//     app.listen(portNo, () => {
//       console.log(`🚀 Server is listening on port ${portNo}`);
//     });
//   } catch (error) {
//     console.error('❌ MongoDB Connection Failed:', error.message);
//     process.exit(1); // Exit the app if DB connection fails
//   }
// };

// startServer();
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import userRoute from './routes/users.js';
import blogRoute from './routes/blog.js';
import authRoute from './routes/auth.js';
import notificationRoutes from "./routes/notification.js";
import badgeRoute from "./routes/badge.js";
import leaderboardRoute from "./routes/leaderboard.js";
import geminiRoutes from "./routes/gaminai.js";
import shareRoutes from "./routes/social.js";
import { startAgenda } from './utils/agenda.js';

dotenv.config({ path: './config.env' });

const app = express();
const portNo = process.env.PORT || 8000;

/* ---------------------- 1. CREATE HTTP SERVER ---------------------- */
const server = createServer(app);

/* ---------------------- 2. INITIALIZE SOCKET.IO ---------------------- */
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Store connected users for real-time notifications
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // User must send their userId after login so we join them to a room
  socket.on("join-user", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* ---------------------- 3. MIDDLEWARE ---------------------- */
app.use(express.json());
const allowedOrigins = [
  'http://localhost:5173', 
  
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed from this origin: ' + origin));
      }
    },
    credentials: true, // allow cookies and auth headers
  })
);
// app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Attach io to request object so controllers can emit notification
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ---------------------- 4. ROUTES ---------------------- */
app.get('/', (req, res) => {
  res.send('API working successfully');
});

// app.use('/db-check', (req, res) => {
//   const isConnected = mongoose.connection.readyState === 1;
//   res.status(isConnected ? 200 : 500).json({
//     connected: isConnected,
//     message: isConnected
//       ? '✅ MongoDB is connected!'
//       : '❌ MongoDB is NOT connected.',
//   });
// });
// Fix /db-check route
app.get('/db-check', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 500).json({
    connected: isConnected,
    message: isConnected
      ? '✅ MongoDB is connected!'
      : '❌ MongoDB is NOT connected.',
  });
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/blogs', blogRoute);
app.use('/api/v1/badges', badgeRoute);
app.use('/api/v1/leaderboards', leaderboardRoute);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/gemini", geminiRoutes);
app.use("/api/v1/share", shareRoutes);



/* ---------------------- 5. MONGO + SERVER + AGENDA START ---------------------- */
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log('✅ MongoDB Connected Successfully');

    
   await startAgenda(io);
    console.log("⏳ Agenda Scheduler Started");

    // Start server WITH Socket.IO
    server.listen(portNo, () => {
      console.log(`🚀 Server running on port ${portNo}`);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

startServer();