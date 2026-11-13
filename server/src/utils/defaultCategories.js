export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Needs', type: 'EXPENSE', isDefault: true, isActive: true },
  { name: 'Wants', type: 'EXPENSE', isDefault: true, isActive: true },
  { name: 'Culture', type: 'EXPENSE', isDefault: true, isActive: true },
  { name: 'Unexpected', type: 'EXPENSE', isDefault: true, isActive: true },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', type: 'INCOME', isDefault: true, isActive: true },
  { name: 'Business', type: 'INCOME', isDefault: true, isActive: true },
  { name: 'Investment', type: 'INCOME', isDefault: true, isActive: true },
  { name: 'Bonus', type: 'INCOME', isDefault: true, isActive: true },
  { name: 'Other', type: 'INCOME', isDefault: true, isActive: true },
];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export async function createDefaultCategoriesForUser(tx, userId) {
  for (const cat of DEFAULT_CATEGORIES) {
    await tx.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: cat.name,
          type: cat.type,
        },
      },
      update: {},
      create: {
        userId,
        name: cat.name,
        type: cat.type,
        isDefault: cat.isDefault,
        isActive: cat.isActive,
      },
    });
  }
}
