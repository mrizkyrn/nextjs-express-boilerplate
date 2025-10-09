import { PrismaClient } from '@prisma/client';

/**
 * Template for creating new seed functions
 *
 * To create a new seed:
 * 1. Copy this file and rename it to `your-seed-name.seed.ts`
 * 2. Implement your seed function following the pattern below
 * 3. Export the function and import it in `../seed.ts`
 * 4. Add the function call to the main seeding process
 */

const prisma = new PrismaClient();

/**
 * Seed [Your Data Name]
 * Creates default/initial data for [describe what it does]
 */
export async function seedYourData(): Promise<void> {
  console.log('📝 Seeding [Your Data Name]...');

  try {
    // Your seeding logic here
    // Example:
    // const existingData = await prisma.yourModel.findFirst();
    // if (!existingData) {
    //   await prisma.yourModel.createMany({
    //     data: [
    //       { name: 'Example 1', ... },
    //       { name: 'Example 2', ... },
    //     ],
    //   });
    // }

    console.log('✅ [Your Data Name] seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding [Your Data Name]:', error);
    throw error;
  }
}
