import { resend, EMAIL_CONFIG, EMAIL_SUBJECTS } from '@/config/email.config';
import { AppError } from '@/helpers/error.helper';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { logger } from '@/config/logger.config';
import { emailTemplateRenderer } from '@/helpers/emailTemplate.helper';
import { EmailOptions, WelcomeEmailData, PasswordResetEmailData, PasswordChangedEmailData, VerifyEmailData } from '@/types/email.type';

export class EmailService {
  /**
   * Send email using Resend API
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { to, subject, html, text } = options;

      const { data, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
        text,
        replyTo: EMAIL_CONFIG.replyTo,
      });

      if (error) {
        logger.error('Email send failed:', error);
        throw new AppError(500, 'Failed to send email', ERROR_CODES.EMAIL_SEND_FAILED);
      }

      logger.info(`Email sent successfully to ${to}`, { emailId: data?.id });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Unexpected error sending email:', error);
      throw new AppError(500, 'Failed to send email', ERROR_CODES.EMAIL_SEND_FAILED);
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const { html, text } = await emailTemplateRenderer.renderWelcomeEmail(data);

    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.WELCOME,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const { html, text } = await emailTemplateRenderer.renderPasswordResetEmail(data);

    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      html,
      text,
    });
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(to: string, data: PasswordChangedEmailData): Promise<void> {
    const formattedTime = data.changeTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const { html, text } = await emailTemplateRenderer.renderPasswordChangedEmail({
      userName: data.userName,
      formattedTime,
    });

    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.PASSWORD_CHANGED,
      html,
      text,
    });
  }

  /**
   * Send email verification email
   */
  async sendVerifyEmail(to: string, data: VerifyEmailData): Promise<void> {
    const { html, text } = await emailTemplateRenderer.renderVerifyEmail(data);

    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
