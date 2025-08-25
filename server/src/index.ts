import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongodb';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await connectToDatabase();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: (error as Error).message });
  } finally {
    await disconnectFromDatabase();
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;


