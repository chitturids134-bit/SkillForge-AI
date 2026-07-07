import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use('/api/auth', authRoutes);

// Profile Routes
app.use('/api/profile', profileRoutes);

// Resume Routes
app.use('/api/resume', resumeRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
