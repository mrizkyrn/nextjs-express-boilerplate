export const DI_TYPES = {
  // ==================== Services ====================
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),

  // ==================== Infrastructure ====================
  EmailService: Symbol.for('EmailService'),
  EmailRenderer: Symbol.for('EmailRenderer'),
  ResendClient: Symbol.for('ResendClient'),
  PrismaClient: Symbol.for('PrismaClient'),
  Logger: Symbol.for('Logger'),

  // ==================== Cron Jobs ====================
  CleanupExpiredTokensJob: Symbol.for('CleanupExpiredTokensJob'),
  CleanupExpiredPaymentsJob: Symbol.for('CleanupExpiredPaymentsJob'),
  GenerateSchedulesJob: Symbol.for('GenerateSchedulesJob'),
  CloseExpiredSchedulesJob: Symbol.for('CloseExpiredSchedulesJob'),
  SendBookingRemindersJob: Symbol.for('SendBookingRemindersJob'),
  CompletePastBookingsJob: Symbol.for('CompletePastBookingsJob'),
  DatabaseCleanupJob: Symbol.for('DatabaseCleanupJob'),
  DatabaseBackupJob: Symbol.for('DatabaseBackupJob'),
} as const;

export const TYPES = DI_TYPES;
