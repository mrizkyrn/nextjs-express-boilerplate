export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: number; // in minutes
}

export interface PasswordChangedEmailData {
  userName: string;
  changeTime: Date;
}

export interface VerifyEmailData {
  userName: string;
  verifyUrl: string;
  expiresIn: number; // in minutes
}

/**
 * Email template data interfaces
 */
export interface BaseTemplateData {
  headerTitle: string;
  headerColor?: string;
  buttonColor?: string;
  footerUrl?: string;
}

export interface WelcomeTemplateData {
  userName: string;
  loginUrl: string;
}

export interface VerifyEmailTemplateData {
  userName: string;
  verifyUrl: string;
  expiresIn: number;
}

export interface PasswordResetTemplateData {
  userName: string;
  resetUrl: string;
  expiresIn: number;
}

export interface PasswordChangedTemplateData {
  userName: string;
  formattedTime: string;
}
