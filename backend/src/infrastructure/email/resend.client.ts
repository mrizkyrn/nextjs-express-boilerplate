import { Resend } from 'resend';
import { injectable } from 'tsyringe';

import { logger } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';
import { ERROR_CODES } from '@/shared/constants';
import { AppError } from '@/shared/utils/error.util';
import { ResendSendOptions, ResendSendResult } from './email.type';

/**
 * Resend Client
 * Low-level wrapper for Resend API operations
 * Handles direct API communication with error handling and logging
 */
@injectable()
export class ResendClient {
  private readonly client: Resend;

  constructor() {
    this.client = new Resend(env.email.resendApiKey);

    logger.info('ResendClient initialized with config:', this.getConfig());
  }

  /**
   * Send email via Resend API
   * Core email sending operation with error handling
   *
   * @param options - Email sending options
   * @returns Send result with email ID
   */
  async send(options: ResendSendOptions): Promise<ResendSendResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        logger.error('Resend API error:', {
          error,
          to: options.to,
          subject: options.subject,
        });

        throw new AppError(500, `Failed to send email: ${error.message}`, ERROR_CODES.EMAIL_SEND_FAILED);
      }

      if (!data || !data.id) {
        throw new AppError(500, 'Failed to send email: No response data', ERROR_CODES.EMAIL_SEND_FAILED);
      }

      return { id: data.id };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error('Resend send failed:', {
        error,
        to: options.to,
        subject: options.subject,
      });

      const errorMessage = error.message || 'Failed to send email';
      throw new AppError(500, `Email send failed: ${errorMessage}`, ERROR_CODES.EMAIL_SEND_FAILED);
    }
  }

  /**
   * Get Resend configuration (safe version for logging)
   */
  getConfig() {
    return {
      apiKey: env.email.resendApiKey ? '***' + env.email.resendApiKey.slice(-4) : undefined,
    };
  }
}
