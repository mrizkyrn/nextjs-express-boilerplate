import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { logger } from '@/infrastructure/logging/winston.logger';
import type {
  BaseTemplateData,
  PasswordChangedTemplateData,
  PasswordResetTemplateData,
  VerifyEmailTemplateData,
  WelcomeTemplateData,
} from './email.type';

/**
 * Email Template Renderer
 * Handles rendering of EJS email templates with base layout
 * Provides both HTML and plain text versions of emails
 */
export class EmailRenderer {
  private templatesDir: string;

  constructor() {
    // Get the directory of the current module file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.templatesDir = path.join(__dirname, './templates');
  }

  /**
   * Render email template with base layout
   * @private Internal helper for template rendering
   *
   * @param templateName - Name of the template file (without .ejs extension)
   * @param data - Template data
   * @param baseData - Base template data (header, colors, etc.)
   * @returns Rendered HTML and text content
   */
  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
    baseData: BaseTemplateData
  ): Promise<{ html: string; text: string }> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
      const basePath = path.join(this.templatesDir, 'base.ejs');

      // Check if templates exist
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
      }
      if (!fs.existsSync(basePath)) {
        throw new Error('Base template not found');
      }

      // Render the content template
      const content = await ejs.renderFile(templatePath, data);

      // Render the base template with content
      const html = await ejs.renderFile(basePath, {
        ...baseData,
        content,
      });

      // Generate plain text version (strip HTML tags)
      const text = this.htmlToText(html);

      return { html, text };
    } catch (error) {
      logger.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Convert HTML to plain text
   * @private Internal helper for text version generation
   *
   * @param html - HTML content
   * @returns Plain text content
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

  // ==================== Public Template Rendering Methods ====================

  /**
   * Render welcome email template
   */
  async renderWelcomeEmail(data: WelcomeTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('welcome', data, {
      headerTitle: 'Selamat Datang!',
      headerColor: '#4F46E5',
      buttonColor: '#4F46E5',
      footerUrl: data.loginUrl,
    });
  }

  /**
   * Render verify email template
   */
  async renderVerifyEmail(data: VerifyEmailTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('verify-email', data, {
      headerTitle: 'Verifikasi Alamat Email Anda',
      headerColor: '#8B5CF6',
      buttonColor: '#8B5CF6',
      footerUrl: data.verifyUrl,
    });
  }

  /**
   * Render password reset email template
   */
  async renderPasswordResetEmail(data: PasswordResetTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('password-reset', data, {
      headerTitle: 'Atur Ulang Kata Sandi Anda',
      headerColor: '#EF4444',
      buttonColor: '#EF4444',
      footerUrl: data.resetUrl,
    });
  }

  /**
   * Render password changed email template
   */
  async renderPasswordChangedEmail(data: PasswordChangedTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('password-changed', data, {
      headerTitle: '✓ Kata Sandi Berhasil Diubah',
      headerColor: '#10B981',
      buttonColor: '#10B981',
    });
  }
}
