 import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
// import eventRoute from './routes/events.js';
// import reviewRoute from './routes/reviews.js';
// import bookingRoute from './routes/bookings.js';
// import timeslotRoute from './routes/timeslots.js';
// import { handleStripePayment } from './Controllers/stripControllers.js';
// import { handleEventStripePayment } from './Controllers/eventstripController.js';
dotenv.config({ path: './config.env' });
const app = express();
const portNo = process.env.PORT || 8000;

// CORS setup
const corsOptions = {
  origin: true,
  credentials: true,
};
// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
// Routes
app.get('/', (req, res) => {
  res.send('API working successfully');
});
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

// MongoDB and server startup
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Database Connected Successfully');

    app.listen(portNo, () => {
      console.log(`🚀 Server is listening on port ${portNo}`);
    });
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // Exit the app if DB connection fails
  }
};

startServer();
