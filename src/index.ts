import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { toIST } from './utils/helpers';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base URL handler
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Personal Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      expenses: '/api/expenses',
      summary: '/api/summary/:userId'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: toIST() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
