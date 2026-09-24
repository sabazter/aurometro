import dotenv from 'dotenv';

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
};
