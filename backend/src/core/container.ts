import 'reflect-metadata';

import type { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';

import { prisma } from '@/infrastructure/database/prisma.client';
import { EmailRenderer } from '@/infrastructure/email/email.renderer';
import { EmailService } from '@/infrastructure/email/email.service';
import { ResendClient } from '@/infrastructure/email/resend.client';
import { ILogger, logger } from '@/infrastructure/logging/winston.logger';
import { AuthService } from '@/modules/auth/auth.service';
import { UserService } from '@/modules/users/user.service';
import { DI_TYPES } from '@/shared/constant';

// ======================= Libraries  =======================

container.register<PrismaClient>(DI_TYPES.PrismaClient, { useValue: prisma });
container.register<ILogger>(DI_TYPES.Logger, { useValue: logger });

container.registerSingleton<ResendClient>(DI_TYPES.ResendClient, ResendClient);
container.registerSingleton<EmailRenderer>(DI_TYPES.EmailRenderer, EmailRenderer);

// ======================= Infrastructure =======================

container.registerSingleton<EmailService>(DI_TYPES.EmailService, EmailService);

// ======================= Domain Services =======================

container.registerSingleton<AuthService>(DI_TYPES.AuthService, AuthService);
container.registerSingleton<UserService>(DI_TYPES.UserService, UserService);

export { container };
