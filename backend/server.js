import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

// Import routers
import authRouter from './routes/auth.js';
import coursesRouter from './routes/courses.js';
import quizzesRouter from './routes/quizzes.js';
import gamificationRouter from './routes/gamification.js';
import chatRouter from './routes/chat.js';
import adminRouter from './routes/admin.js';
import notificationsRouter from './routes/notifications.js';
import certificatesRouter from './routes/certificates.js';
import bannersRouter from './routes/banners.js';
import feedbackRouter from './routes/feedback.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static folder for uploaded avatars and assignments files
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edukids';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Database.'))
  .catch((err) => {
    console.error('================================================================');
    console.error('CRITICAL WARNING: Failed to connect to MongoDB server!');
    console.error('Please ensure MongoDB is installed and running on your machine.');
    console.error('Database connection error details:', err.message);
    console.error('================================================================');
  });

// Bind Socket.IO user map
const activeSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Register user id with socket id
  socket.on('register_user', (userId) => {
    activeSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle direct messages
  socket.on('send_message', (data) => {
    // data: { senderId, receiverId, content, messageObject }
    const receiverSocketId = activeSockets.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data.messageObject);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    for (let [userId, socketId] of activeSockets.entries()) {
      if (socketId === socket.id) {
        activeSockets.delete(userId);
        break;
      }
    }
  });
});

// Make Socket.IO available in express routes if needed
app.use((req, res, next) => {
  req.io = io;
  req.activeSockets = activeSockets;
  next();
});

// REST API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/feedback', feedbackRouter);

// Fallback test route
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Healthy', time: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Có lỗi nghiêm trọng xảy ra trên máy chủ!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend EduKids server running on port http://localhost:${PORT}`);
});
