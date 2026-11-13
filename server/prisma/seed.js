import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import { createDefaultCategoriesForUser } from '../src/utils/defaultCategories.js';

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin', 10);

  await prisma.$transaction(async (tx) => {
    const adminUser = await tx.user.upsert({
      where: { email: 'admin' },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin',
        passwordHash: adminPasswordHash,
      },
    });

    await createDefaultCategoriesForUser(tx, adminUser.id);
    console.log(`Seeded default account (${adminUser.email}) with default categories.`);
  });

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  for (const user of users) {
    if (user.email === 'admin') continue;
    await prisma.$transaction(async (tx) => {
      await createDefaultCategoriesForUser(tx, user.id);
    });
    console.log(`Ensured default categories for user ${user.email}`);
  }
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
