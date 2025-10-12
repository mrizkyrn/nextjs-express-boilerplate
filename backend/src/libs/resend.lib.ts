import { Resend } from 'resend';
import { env } from '@/config/environment.config';

/**
 * Initialize Resend client with API key from environment
 */
export const resend = new Resend(env.RESEND_API_KEY);
