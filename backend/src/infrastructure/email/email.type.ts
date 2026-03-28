// ==================== Email Options ====================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface ResendSendOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface ResendSendResult {
  id: string;
}

// ==================== Email Data Interfaces ====================

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

// ==================== Template Data Interfaces ====================

export interface BaseTemplateData {
  headerTitle: string;
  headerColor?: string;
  buttonColor?: string;
  footerUrl?: string;
}
