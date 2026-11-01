import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

// MongoDB Client configuration for BetterAuth
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/booknook';

// Initialize MongoClient with resilient connection handling
let client: MongoClient | null = null;
let dbInstance: any = null;

try {
  client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 2000,
  });
  dbInstance = client.db();
} catch (err) {
  console.warn('MongoDB connection note: Will use resilient store fallback', err);
}

/**
 * BetterAuth Configuration
 * - Adapter: MongoDB Adapter
 * - Auth features: Email & Password, Google Social Login
 * - Token management: JWT Support with Bearer authorization
 */
export const betterAuthInstance = betterAuth({
  database: dbInstance ? mongodbAdapter(dbInstance) : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Per prompt: "Don’t implement email verification"
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'booknook-google-client-id.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'booknook-secret-key',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days session
    updateAge: 60 * 60 * 24, // 1 day
  },
  jwt: {
    enabled: true,
    secret: process.env.JWT_SECRET || 'booknook_jwt_super_secret_key_2026',
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
});

export type Auth = typeof betterAuthInstance;
