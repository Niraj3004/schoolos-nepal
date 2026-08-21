import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { connectDB } from './config/db';
import { globalErrorHandler } from './middlewares/error';
import { successResponse } from './utils/response';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Healthcheck endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  return successResponse(res, { status: 'UP', timestamp: new Date().toISOString() }, 'Health check passed', 200);
});

// API Routes
app.use('/api/v1', routes);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
