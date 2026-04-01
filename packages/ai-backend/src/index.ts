import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import conversationRouter from './routes/conversation.js';
import { apiKeyAuth } from './middleware/auth.js';
import { closePool } from './lib/db.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
  }),
);

// JSON body parser
app.use(express.json({ limit: '1mb' }));

// Rate limiting: 10 conversations/hour per IP
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600, // 1 hour
});

app.use('/api', async (req, res, next) => {
  try {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    await rateLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests. Try again later.' });
  }
});

// API key authentication
app.use('/api', apiKeyAuth);

// Routes
app.use('/api', conversationRouter);

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Graceful shutdown
const server = app.listen(port, () => {
  console.log(`AI Backend running on port ${port}`);
});

async function shutdown() {
  console.log('Shutting down gracefully...');
  server.close();
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
