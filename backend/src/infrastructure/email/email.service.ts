import { inject, injectable } from 'tsyringe';

import type { ILogger } from '@/infrastructure/logging/winston.logger';
import { EMAIL_CONFIG, EMAIL_SUBJECTS } from '@/shared/config/email.config';
import { DI_TYPES } from '@/shared/constants/di-types';
import type { EmailRenderer } from './email.renderer';
import type { PasswordChangedEmailData, PasswordResetEmailData, VerifyEmailData, WelcomeEmailData } from './email.type';
import type { ResendClient } from './resend.client';

/**
 * Email Service
 * Mid-level service for email operations with business logic
 * Handles email composition, rendering, and sending via ResendClient
 * Provider-agnostic interface for sending emails throughout the application
 */
@injectable()
export class EmailService {
  constructor(
    @inject(DI_TYPES.ResendClient) private readonly resendClient: ResendClient,
    @inject(DI_TYPES.EmailRenderer) private readonly emailRenderer: EmailRenderer,
    @inject(DI_TYPES.Logger) private readonly logger: ILogger
  ) {}

  // ==================== Private Helper Methods ====================

  /**
   * Send email with rendered content
   * @private Internal helper for sending emails
   *
   * @param to - Recipient email address(es)
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Plain text content
   * @param emailType - Type of email for logging
   */
  private async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text: string,
    emailType?: string
  ): Promise<void> {
    const result = await this.resendClient.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    this.logger.info(`${emailType || 'Email'} sent successfully`, { emailId: result.id, to });
  }

  /**
   * Send email safely (non-blocking, fire-and-forget)
   * Wraps email promises in try-catch to prevent blocking operations
   * Errors are logged but don't propagate - suitable for notification emails
   *
   * @param emailPromise - Promise from any send email method
   * @param context - Description for logging purposes
   */
  async sendEmailSafely(emailPromise: Promise<void>, context: string): Promise<void> {
    try {
      await emailPromise;
    } catch (error) {
      this.logger.error(`Failed to send ${context} email:`, { error });
      // Error logged but not thrown - non-blocking behavior
    }
  }

  // ==================== User Registration ====================

  /**
   * Send email verification email
   * Sends verification link to confirm email address
   */
  async sendVerifyEmail(to: string, data: VerifyEmailData): Promise<void> {
    const { html, text } = await this.emailRenderer.renderVerifyEmail(data);

    await this.sendEmail(to, EMAIL_SUBJECTS.VERIFY_EMAIL, html, text, 'Email verification');
  }

  /**
   * Send welcome email to new users
   * Sends welcome message with account setup information
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const { html, text } = await this.emailRenderer.renderWelcomeEmail(data);

    await this.sendEmail(to, EMAIL_SUBJECTS.WELCOME, html, text, 'Welcome');
  }

  // ==================== Password Management ====================

  /**
   * Send password reset email
   * Sends password reset link to user email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const { html, text } = await this.emailRenderer.renderPasswordResetEmail(data);

    await this.sendEmail(to, EMAIL_SUBJECTS.PASSWORD_RESET, html, text, 'Password reset');
  }

  /**
   * Send password changed confirmation email
   * Notifies user of successful password change
   */
  async sendPasswordChangedEmail(to: string, data: PasswordChangedEmailData): Promise<void> {
    const formattedTime = data.changeTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const { html, text } = await this.emailRenderer.renderPasswordChangedEmail({
      userName: data.userName,
      formattedTime,
    });

    await this.sendEmail(to, EMAIL_SUBJECTS.PASSWORD_CHANGED, html, text, 'Password changed confirmation');
  }
}
