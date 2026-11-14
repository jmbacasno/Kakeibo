import bcryptjs from "bcryptjs";
import { DEFAULT_KAKEIBO_CATEGORIES } from "../application/services/defaultCategoryTemplates.js";
import { DEFAULT_USER_SETTINGS } from "../domain/entities/userSettings/index.js";
import { settings } from "../infrastructure/config.js";
import { prisma } from "../infrastructure/persistence/clients/prisma.js";

async function ensureDefaultCategoriesForUser(userId: number): Promise<void> {
  for (const template of DEFAULT_KAKEIBO_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: template.name,
          type: template.type,
        },
      },
      update: {},
      create: {
        userId,
        name: template.name,
        type: template.type,
        isDefault: true,
        isActive: true,
      },
    });
  }
}

async function ensureDefaultSettingsForUser(userId: number): Promise<void> {
  await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      currency: DEFAULT_USER_SETTINGS.currency,
      language: DEFAULT_USER_SETTINGS.language,
      theme: DEFAULT_USER_SETTINGS.theme,
      dateFormat: DEFAULT_USER_SETTINGS.dateFormat,
      firstDayOfWeek: DEFAULT_USER_SETTINGS.firstDayOfWeek,
    },
  });
}

async function seedDefaultAccounts(): Promise<void> {
  const adminPasswordHash = await bcryptjs.hash("admin", settings.bcryptSaltRounds);

  const accounts = [
    { name: "Administrator", email: "admin" },
    { name: "Admin", email: "admin@gmail.com" },
  ];

  for (const account of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          passwordHash: adminPasswordHash,
        },
      });
      await ensureDefaultCategoriesForUser(created.id);
      await ensureDefaultSettingsForUser(created.id);
    } else {
      await ensureDefaultCategoriesForUser(existing.id);
      await ensureDefaultSettingsForUser(existing.id);
    }
  }

  const allUsers = await prisma.user.findMany({ select: { id: true } });
  for (const user of allUsers) {
    await ensureDefaultCategoriesForUser(user.id);
    await ensureDefaultSettingsForUser(user.id);
  }
}

async function main(): Promise<void> {
  await seedDefaultAccounts();
  console.log("Kakeibo database seed completed (default admin/admin ready).");
}

main()
  .catch((err) => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
