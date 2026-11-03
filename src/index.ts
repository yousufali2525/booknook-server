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
const PORT = Number(process.env.PORT);
const MONGO_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL;
if (!MONGO_URI) {
  throw new Error('MONGODB_URI is missing from .env file');
}
if (!CLIENT_URL) {
  throw new Error('CLIENT_URL is missing from .env file');
}
const allowedOrigins = [CLIENT_URL];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const isVercelPreview = /^https:\/\/booknook-[a-z0-9-]+-22-cc8a\.vercel\.app$/.test(origin);
    if (isVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
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
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server Error:', error);
    process.exit(1);
  }
};
startServer();
export default app;