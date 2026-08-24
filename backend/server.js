import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { bootstrapAdmin } from './services/bootstrapAdmin.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import projectStudioRoutes from './routes/projectStudioRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => bootstrapAdmin());

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Attach socket.io instance to Express app
app.set('io', io);

// Socket.IO Events
io.on('connection', (socket) => {
  // Join private room per user
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // Typing start event
  socket.on('typing:start', ({ conversationId, receiverId, userName }) => {
    if (receiverId) {
      io.to(`user:${receiverId}`).emit('typing:start', { conversationId, userName });
    }
  });

  // Typing stop event
  socket.on('typing:stop', ({ conversationId, receiverId }) => {
    if (receiverId) {
      io.to(`user:${receiverId}`).emit('typing:stop', { conversationId });
    }
  });

  socket.on('disconnect', () => {});
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
// Serve uploaded avatar images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use('/api/auth', authRoutes);

// Profile Routes
app.use('/api/profile', profileRoutes);

// Resume Routes
app.use('/api/resume', resumeRoutes);

// Interview Routes
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes);

// Portfolio Routes
app.use('/api/portfolio', portfolioRoutes);

// Assessment Routes
app.use('/api/assessments', assessmentRoutes);

// Projects Studio Routes
app.use('/api/projects', projectStudioRoutes);

// AI Mentor Routes
app.use('/api/mentor', mentorRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Settings Routes
app.use('/api/settings', settingsRoutes);

// Message Routes
app.use('/api/messages', messageRoutes);

// Recruiter Routes
app.use('/api/recruiter', recruiterRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/career-roadmap', roadmapRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SkillForge AI Backend is running smoothly',
    timestamp: new Date()
  });
});

// Fallback Route
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API route not found'
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

let PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (port) => {
  httpServer.removeAllListeners('error');
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
      setTimeout(() => {
        startServer(port + 1);
      }, 500);
    } else {
      console.error('Server error:', err);
    }
  });

  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer(PORT);
