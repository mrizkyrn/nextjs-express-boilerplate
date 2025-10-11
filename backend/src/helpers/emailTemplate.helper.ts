import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  BaseTemplateData,
  PasswordChangedTemplateData,
  PasswordResetTemplateData,
  VerifyEmailTemplateData,
  WelcomeTemplateData,
} from '@/types/email.type';

/**
 * Email Template Renderer
 * Handles rendering of EJS email templates
 */
export class EmailTemplateRenderer {
  private templatesDir: string;

  constructor() {
    // Get the directory of the current module file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.templatesDir = path.join(__dirname, '../templates/emails');
  }

  /**
   * Render email template
   * @param templateName - Name of the template file (without .ejs extension)
   * @param data - Template data
   * @param baseData - Base template data (header, colors, etc.)
   * @returns Rendered HTML and text content
   */
  private async renderTemplate(templateName: string, data: Record<string, any>, baseData: BaseTemplateData): Promise<{ html: string; text: string }> {
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
      console.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Convert HTML to plain text
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

  /**
   * Render welcome email template
   * @param data - Template data
   * @returns Rendered HTML and text content
   */
  async renderWelcomeEmail(data: WelcomeTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('welcome', data, {
      headerTitle: 'Welcome!',
      headerColor: '#4F46E5',
      buttonColor: '#4F46E5',
      footerUrl: data.loginUrl,
    });
  }

  /**
   * Render verify email template
   * @param data - Template data
   * @returns Rendered HTML and text content
   */
  async renderVerifyEmail(data: VerifyEmailTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('verify-email', data, {
      headerTitle: 'Verify Your Email Address',
      headerColor: '#8B5CF6',
      buttonColor: '#8B5CF6',
      footerUrl: data.verifyUrl,
    });
  }

  /**
   * Render password reset email template
   * @param data - Template data
   * @returns Rendered HTML and text content
   */
  async renderPasswordResetEmail(data: PasswordResetTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('password-reset', data, {
      headerTitle: 'Reset Your Password',
      headerColor: '#EF4444',
      buttonColor: '#EF4444',
      footerUrl: data.resetUrl,
    });
  }

  /**
   * Render password changed email template
   * @param data - Template data
   * @returns Rendered HTML and text content
   */
  async renderPasswordChangedEmail(data: PasswordChangedTemplateData): Promise<{ html: string; text: string }> {
    return this.renderTemplate('password-changed', data, {
      headerTitle: '✓ Password Changed Successfully',
      headerColor: '#10B981',
      buttonColor: '#10B981',
    });
  }
}

export const emailTemplateRenderer = new EmailTemplateRenderer();
