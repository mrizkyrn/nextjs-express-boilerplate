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

export interface TNIVerificationApprovedEmailData {
  userName: string;
  approvedAt: Date;
}

export interface TNIVerificationRejectedEmailData {
  userName: string;
  rejectionReason: string;
  rejectedAt: Date;
  resubmitUrl: string;
}

export interface BookingReminderEmailData {
  userName: string;
  serviceName: string;
  scheduleDate: Date;
  amount: number;
}

// ==================== Template Data Interfaces ====================

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

export interface TNIVerificationApprovedTemplateData {
  userName: string;
  approvedAt: Date;
  formattedApprovedTime: string;
}

export interface TNIVerificationRejectedTemplateData {
  userName: string;
  rejectionReason: string;
  rejectedAt: Date;
  resubmitUrl: string;
  formattedRejectedTime: string;
}

export interface BookingReminderTemplateData {
  userName: string;
  serviceName: string;
  scheduleDate: Date;
  formattedDate: string;
  formattedTime: string;
  formattedAmount: string;
}
