import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrows.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('MONGODB_URI is missing from .env file');
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'BookNook Server is running properly!',
    status: 'online',
  });
});

app.use('/api/books', bookRoutes);
app.use('/books', bookRoutes);

app.use('/api/borrows', borrowRoutes);
app.use('/borrows', borrowRoutes);

app.use('/api/upload', uploadRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected Successfully!');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server Error:', error);
    process.exit(1);
  }
};

startServer();

export default app;