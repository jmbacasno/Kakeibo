-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CategoryBudget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthlyPlanId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "allocatedAmount" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryBudget_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryBudget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CategoryBudget" ("allocatedAmount", "categoryId", "createdAt", "id", "monthlyPlanId", "updatedAt") SELECT "allocatedAmount", "categoryId", "createdAt", "id", "monthlyPlanId", "updatedAt" FROM "CategoryBudget";
DROP TABLE "CategoryBudget";
ALTER TABLE "new_CategoryBudget" RENAME TO "CategoryBudget";
CREATE INDEX "CategoryBudget_monthlyPlanId_idx" ON "CategoryBudget"("monthlyPlanId");
CREATE INDEX "CategoryBudget_categoryId_idx" ON "CategoryBudget"("categoryId");
CREATE UNIQUE INDEX "CategoryBudget_monthlyPlanId_categoryId_key" ON "CategoryBudget"("monthlyPlanId", "categoryId");
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthlyPlanId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "description" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "description", "id", "monthlyPlanId", "transactionDate", "updatedAt") SELECT "amount", "categoryId", "createdAt", "description", "id", "monthlyPlanId", "transactionDate", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_monthlyPlanId_transactionDate_idx" ON "Transaction"("monthlyPlanId", "transactionDate");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

