import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser'; // TODO: Enable when authentication is ready
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware - Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sheet-front.vercel.app',
  'https://sheet-back.vercel.app',
  FRONTEND_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Vercel functions)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => 
      allowed && (origin === allowed || origin.includes(allowed))
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
}));
app.use(express.json());
// app.use(cookieParser()); // TODO: Enable when authentication is ready

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
// import authRoutes from './routes/auth'; // TODO: Enable when authentication is ready
import shiftReportRoutes from './routes/shiftReports';
import aggregateRoutes from './routes/aggregates';
import dashboardRoutes from './routes/dashboard';

app.get('/api', (req, res) => {
  res.json({ message: 'Financial Tracking System API' });
});

// app.use('/api/auth', authRoutes); // TODO: Enable when authentication is ready
app.use('/api/shift-reports', shiftReportRoutes);
app.use('/api/aggregates', aggregateRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using local JSON storage in ./data directory`);
});
