import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongodb';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await connectToDatabase();
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running and database is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// User routes
app.use('/api/users', userRoutes);

// Test endpoint to check database connection
app.get('/api/test-db', async (_req: Request, res: Response) => {
  try {
    const mongoose = await connectToDatabase();
    res.status(200).json({ 
      success: true,
      message: 'Database connection successful',
      connectionState: mongoose.connection.readyState,
      database: mongoose.connection.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔗 Database test: http://localhost:${port}/api/test-db`);
    console.log(`👥 User API: http://localhost:${port}/api/users`);
    console.log(`📱 Mobile access: http://192.168.8.153:${port}`);
  });
}

export default app;


