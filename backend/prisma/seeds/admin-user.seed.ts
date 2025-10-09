import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Define UserRole enum locally
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

const prisma = new PrismaClient();

/**
 * Seed admin user
 * Creates a default admin user if it doesn't exist
 */
export async function seedAdminUser(): Promise<void> {
  console.log('👤 Seeding admin user...');

  // Use environment variables or defaults
  const adminEmail = (globalThis as any).process?.env?.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || 'Admin123!';
  const adminName = (globalThis as any).process?.env?.ADMIN_NAME || 'System Administrator';

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists:', existingAdmin.email);
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created successfully:');
  console.log('   Email:', adminUser.email);
  console.log('   Name:', adminUser.name);
  console.log('   Role:', adminUser.role);
}
