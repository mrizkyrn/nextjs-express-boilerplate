import { CorsOptions } from 'cors';
import { env } from './environment.config';

export const corsConfig: CorsOptions = {
  origin: env.NODE_ENV === 'production' ? [env.FRONTEND_URL] : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
