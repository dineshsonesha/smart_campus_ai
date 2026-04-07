import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import router from './routes';
import { SocketService } from './services/socket.service';
import { StreamService } from './services/stream.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

// Global Middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Clerk Authentication Middleware
app.use(authMiddleware);

// API Routes
app.use('/api', router);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date() });
});

// Error Handling
app.use(errorHandler);

// Initialize Services
SocketService.initialize(httpServer);
StreamService.initializeAllStreams().catch((err) => {
  console.error('[Stream] Failed to initialize streams:', err.message);
});

httpServer.listen(port, () => {
  console.log(`🚀 Smart-Eye API Server running on port ${port}`);
  console.log(`🎮 Socket.IO Hub is ready`);
});
