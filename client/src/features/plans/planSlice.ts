import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { ApiSuccessResponse, MonthlyPlan, PlanStatus } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';

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

export const fetchPlans = createAsyncThunk<MonthlyPlan[], void, { rejectValue: string }>(
  'plans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiSuccessResponse<{ plans: MonthlyPlan[] }>>('/plans');
      return res.data.data.plans;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchCurrentPlan = createAsyncThunk<
  MonthlyPlan | null,
  { month: number; year: number },
  { rejectValue: string }
>('plans/fetchCurrent', async ({ month, year }, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiSuccessResponse<{ plan: MonthlyPlan | null }>>('/plans/current', {
      params: { month, year },
    });
    return res.data.data.plan;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createPlan = createAsyncThunk<MonthlyPlan, CreatePlanPayload, { rejectValue: string }>(
  'plans/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post<ApiSuccessResponse<{ plan: MonthlyPlan }>>('/plans', payload);
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updatePlan = createAsyncThunk<
  MonthlyPlan,
  { id: number; data: UpdatePlanPayload },
  { rejectValue: string }
>('plans/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}`, data);
    return res.data.data.plan;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updatePlanStatus = createAsyncThunk<
  MonthlyPlan,
  { id: number; status: PlanStatus },
  { rejectValue: string }
>('plans/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}/status`, {
      status,
    });
    return res.data.data.plan;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const savePlanBudgets = createAsyncThunk<
  MonthlyPlan,
  { id: number; budgets: PlanBudgetInput[] },
  { rejectValue: string }
>('plans/saveBudgets', async ({ id, budgets }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiSuccessResponse<{ plan: MonthlyPlan }>>(`/plans/${id}/budgets`, {
      budgets,
    });
    return res.data.data.plan;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

interface PlanState {
  selectedMonth: number;
  selectedYear: number;
  plans: MonthlyPlan[];
  currentPlan: MonthlyPlan | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const now = new Date();

const initialState: PlanState = {
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  plans: [],
  currentPlan: null,
  loading: false,
  saving: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setSelectedPeriod(state, action: PayloadAction<{ month: number; year: number }>) {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
    clearPlanError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load plans.';
      })
      .addCase(fetchCurrentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchCurrentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load current plan.';
      })
      .addCase(createPlan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.saving = false;
        state.currentPlan = action.payload;
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.plans[idx] = action.payload;
        } else {
          state.plans.unshift(action.payload);
        }
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to create plan.';
      })
      .addCase(updatePlan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.saving = false;
        if (state.currentPlan?.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.plans[idx] = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to update plan.';
      })
      .addCase(updatePlanStatus.fulfilled, (state, action) => {
        if (state.currentPlan?.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.plans[idx] = action.payload;
        }
      })
      .addCase(savePlanBudgets.pending, (state) => {
        state.saving = true;
      })
      .addCase(savePlanBudgets.fulfilled, (state, action) => {
        state.saving = false;
        if (state.currentPlan?.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.plans[idx] = action.payload;
        }
      })
      .addCase(savePlanBudgets.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to save budgets.';
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export const { setSelectedPeriod, clearPlanError } = planSlice.actions;
export default planSlice.reducer;
