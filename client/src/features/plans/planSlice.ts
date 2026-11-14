import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { MonthlyPlan, PlanStatus } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import {
  CreatePlanPayload,
  FetchCurrentPlanParams,
  planService,
  PlanBudgetInput,
  UpdatePlanPayload,
} from './planService';

export type {
  CreatePlanPayload,
  FetchCurrentPlanParams,
  PlanBudgetInput,
  UpdatePlanPayload,
};

export const fetchPlans = createAsyncThunk<MonthlyPlan[], void, { rejectValue: string }>(
  'plans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await planService.fetchAll();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchCurrentPlan = createAsyncThunk<
  MonthlyPlan | null,
  FetchCurrentPlanParams,
  { rejectValue: string }
>('plans/fetchCurrent', async (params, { rejectWithValue }) => {
  try {
    return await planService.fetchCurrent(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createPlan = createAsyncThunk<MonthlyPlan, CreatePlanPayload, { rejectValue: string }>(
  'plans/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await planService.create(payload);
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
    return await planService.update(id, data);
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
    return await planService.updateStatus(id, status);
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
    return await planService.saveBudgets(id, budgets);
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
