import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import subjectsRoutes from './routes/subjects.js';
import topicsRoutes from './routes/topics.js';
import tasksRoutes from './routes/tasks.js';
import studySessionsRoutes from './routes/studySessions.js';
import practiceRoutes from './routes/practice.js';
import dsaRoutes from './routes/dsa.js';
import interviewRoutes from './routes/interview.js';
import revisionsRoutes from './routes/revisions.js';
import mistakesRoutes from './routes/mistakes.js';
import goalsRoutes from './routes/goals.js';
import projectsRoutes from './routes/projects.js';
import notesRoutes from './routes/notes.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/study-sessions', studySessionsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/mistakes', mistakesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PrepTrack AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[PrepTrack AI Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
