-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "id", "name", "type", "updatedAt", "userId") SELECT "createdAt", "id", "name", "type", "updatedAt", "userId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_userId_type_idx" ON "Category"("userId", "type");
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");
UPDATE "Category" SET "description" = 'Essential living expenses' WHERE "name" = 'Needs' AND "type" = 'EXPENSE' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Discretionary purchases' WHERE "name" = 'Wants' AND "type" = 'EXPENSE' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Learning, books, and personal growth' WHERE "name" = 'Culture' AND "type" = 'EXPENSE' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Unplanned or emergency expenses' WHERE "name" = 'Unexpected' AND "type" = 'EXPENSE' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Primary employment income' WHERE "name" = 'Salary' AND "type" = 'INCOME' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Self-employment or freelance earnings' WHERE "name" = 'Business' AND "type" = 'INCOME' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Dividends, interest, and capital returns' WHERE "name" = 'Investment' AND "type" = 'INCOME' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Performance or seasonal bonuses' WHERE "name" = 'Bonus' AND "type" = 'INCOME' AND "description" IS NULL;
UPDATE "Category" SET "description" = 'Miscellaneous income sources' WHERE "name" = 'Other' AND "type" = 'INCOME' AND "description" IS NULL;
CREATE TABLE "new_MonthlyPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "plannedIncome" DECIMAL NOT NULL DEFAULT 0,
    "savingsGoal" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MonthlyPlan" ("createdAt", "id", "month", "plannedIncome", "savingsGoal", "updatedAt", "userId", "year") SELECT "createdAt", "id", "month", "plannedIncome", "savingsGoal", "updatedAt", "userId", "year" FROM "MonthlyPlan";
DROP TABLE "MonthlyPlan";
ALTER TABLE "new_MonthlyPlan" RENAME TO "MonthlyPlan";
CREATE INDEX "MonthlyPlan_userId_year_month_idx" ON "MonthlyPlan"("userId", "year", "month");
CREATE UNIQUE INDEX "MonthlyPlan_userId_month_year_key" ON "MonthlyPlan"("userId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

