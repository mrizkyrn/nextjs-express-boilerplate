import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { inject, injectable } from 'tsyringe';
import { fileURLToPath } from 'url';

import type { ILogger } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';
import { DI_TYPES, EMAIL_SUBJECTS } from '@/shared/constants';
import type {
  BaseTemplateData,
  PasswordChangedEmailData,
  PasswordResetEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from './email.type';
import type { ResendClient } from './resend.client';

/**
 * Email Service
 * Handles email composition, template rendering, and sending
 * Provides provider-agnostic interface for sending emails throughout the application
 */
@injectable()
export class EmailService {
  private templatesDir: string;

  constructor(
    @inject(DI_TYPES.ResendClient) private readonly resendClient: ResendClient,
    @inject(DI_TYPES.Logger) private readonly logger: ILogger
  ) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.templatesDir = path.join(__dirname, './templates');
  }

  // ==================== Private Helper Methods ====================

  /**
   * Render email template with base layout
   * @private Internal helper for template rendering
   */
  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
    baseData: BaseTemplateData
  ): Promise<{ html: string; text: string }> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
      const basePath = path.join(this.templatesDir, 'base.ejs');

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
      }
      if (!fs.existsSync(basePath)) {
        throw new Error('Base template not found');
      }

      const content = await ejs.renderFile(templatePath, data);
      const html = await ejs.renderFile(basePath, { ...baseData, content });
      const text = this.htmlToText(html);

      return { html, text };
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}:`, { error });
      throw error;
    }
  }

  /**
   * Convert HTML to plain text
   * @private Internal helper for text version generation
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Send email with rendered content
   * @private Internal helper for sending emails
   */
  private async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text: string,
    emailType?: string
  ): Promise<void> {
    const result = await this.resendClient.send({
      from: env.email.from,
      to,
      subject,
      html,
      text,
      replyTo: env.email.from,
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
    const { html, text } = await this.renderTemplate('verify-email', data, {
      headerTitle: 'Verifikasi Alamat Email Anda',
      headerColor: '#8B5CF6',
      buttonColor: '#8B5CF6',
      footerUrl: data.verifyUrl,
    });

    await this.sendEmail(to, EMAIL_SUBJECTS.VERIFY_EMAIL, html, text, 'Email verification');
  }

  /**
   * Send welcome email to new users
   * Sends welcome message with account setup information
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const { html, text } = await this.renderTemplate('welcome', data, {
      headerTitle: 'Selamat Datang!',
      headerColor: '#4F46E5',
      buttonColor: '#4F46E5',
      footerUrl: data.loginUrl,
    });

    await this.sendEmail(to, EMAIL_SUBJECTS.WELCOME, html, text, 'Welcome');
  }

  // ==================== Password Management ====================

  /**
   * Send password reset email
   * Sends password reset link to user email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const { html, text } = await this.renderTemplate('password-reset', data, {
      headerTitle: 'Atur Ulang Kata Sandi Anda',
      headerColor: '#EF4444',
      buttonColor: '#EF4444',
      footerUrl: data.resetUrl,
    });

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

    const { html, text } = await this.renderTemplate(
      'password-changed',
      {
        userName: data.userName,
        formattedTime,
      },
      {
        headerTitle: '✓ Kata Sandi Berhasil Diubah',
        headerColor: '#10B981',
        buttonColor: '#10B981',
      }
    );

    await this.sendEmail(to, EMAIL_SUBJECTS.PASSWORD_CHANGED, html, text, 'Password changed confirmation');
  }
}
