export type CategoryType = 'INCOME' | 'EXPENSE';
export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CategoryUsageCounts {
  transactions: number;
  categoryBudgets: number;
}

export interface Category {
  id: number;
  userId: number;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  _count?: CategoryUsageCounts;
}

export interface CategoryBudget {
  id: number;
  monthlyPlanId: number;
  categoryId: number;
  allocatedAmount: number;
  category: Category | null;
}

export interface CategoryBreakdownItem {
  categoryId: number;
  categoryName: string;
  isDefault: boolean;
  isActive: boolean;
  allocatedAmount: number;
  actualSpent: number;
  remainingBudget: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  hasZeroAllocation: boolean;
}

export interface PlanSummary {
  plannedIncome: number;
  actualIncome: number;
  savingsGoal: number;
  actualSavings: number;
  savingsProgressPercent: number;
  plannedAvailableExpenses: number;
  totalAllocatedBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  allocationDifference: number;
  allocationExceedsAvailable: boolean;
  overallUtilizationPercent: number;
  categoryBreakdown: CategoryBreakdownItem[];
  overBudgetCategories: CategoryBreakdownItem[];
}

export interface MonthlyPlan {
  id: number;
  userId: number;
  month: number;
  year: number;
  plannedIncome: number;
  savingsGoal: number;
  status: PlanStatus;
  createdAt: string | null;
  updatedAt: string | null;
  budgets: CategoryBudget[];
  summary: PlanSummary;
}

export interface TransactionPlanSummary {
  id: number;
  month: number;
  year: number;
}

export interface Transaction {
  id: number;
  monthlyPlanId: number;
  categoryId: number;
  type: CategoryType;
  amount: number;
  description: string;
  transactionDate: string;
  createdAt: string | null;
  updatedAt: string | null;
  category: Category | null;
  monthlyPlan: TransactionPlanSummary | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Note {
  id: number;
  monthlyPlanId: number;
  title: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  monthlyPlan: TransactionPlanSummary | null;
}

export interface MonthlyReflection {
  id: number;
  monthlyPlanId: number;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  monthlyPlan: {
    id: number;
    month: number;
    year: number;
    status: string;
  } | null;
  financialSummary?: PlanSummary | null;
}

export interface AvailableMonthItem {
  id: number;
  month: number;
  year: number;
  status: PlanStatus;
}

export interface DashboardData {
  month: number;
  year: number;
  hasPlan: boolean;
  plan: MonthlyPlan | null;
  summary: PlanSummary | null;
  recentTransactions: Transaction[];
  availableMonths: AvailableMonthItem[];
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}
