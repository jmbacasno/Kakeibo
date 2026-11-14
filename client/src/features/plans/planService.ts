import api from '../../services/api';
import { ApiSuccessResponse, MonthlyPlan, PlanStatus } from '../../types/models';

export interface PlanBudgetInput {
  categoryId: number;
  allocatedAmount: number;
}

export interface CreatePlanPayload {
  month: number;
  year: number;
  plannedIncome: number;
  savingsGoal: number;
  status?: PlanStatus;
  budgets?: PlanBudgetInput[];
}

export interface UpdatePlanPayload {
  plannedIncome?: number;
  savingsGoal?: number;
  status?: PlanStatus;
  budgets?: PlanBudgetInput[];
}

export interface FetchCurrentPlanParams {
  month: number;
  year: number;
}

export async function fetchAll(): Promise<MonthlyPlan[]> {
  const res = await api.get<ApiSuccessResponse<{ plans: MonthlyPlan[] }>>('/plans');
  return res.data.data.plans;
}

export async function fetchCurrent({ month, year }: FetchCurrentPlanParams): Promise<MonthlyPlan | null> {
  const res = await api.get<ApiSuccessResponse<{ plan: MonthlyPlan | null }>>('/plans/current', {
    params: { month, year },
  });
  return res.data.data.plan;
}

export async function create(payload: CreatePlanPayload): Promise<MonthlyPlan> {
  const res = await api.post<ApiSuccessResponse<{ plan: MonthlyPlan }>>('/plans', payload);
  return res.data.data.plan;
}

export async function update(id: number, data: UpdatePlanPayload): Promise<MonthlyPlan> {
  const res = await api.put<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}`, data);
  return res.data.data.plan;
}

export async function updateStatus(id: number, status: PlanStatus): Promise<MonthlyPlan> {
  const res = await api.patch<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}/status`, {
    status,
  });
  return res.data.data.plan;
}

export async function saveBudgets(id: number, budgets: PlanBudgetInput[]): Promise<MonthlyPlan> {
  const res = await api.put<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}/budgets`, {
    budgets,
  });
  return res.data.data.plan;
}

export const planService = {
  fetchAll,
  fetchCurrent,
  create,
  update,
  updateStatus,
  saveBudgets,
};

export default planService;
