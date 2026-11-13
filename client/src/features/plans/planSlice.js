import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchPlans = createAsyncThunk(
  'plans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/plans');
      return res.data.data.plans;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCurrentPlan = createAsyncThunk(
  'plans/fetchCurrent',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await api.get('/plans/current', { params: { month, year } });
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPlan = createAsyncThunk(
  'plans/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/plans', payload);
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/plans/${id}`, data);
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePlanStatus = createAsyncThunk(
  'plans/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/plans/${id}/status`, { status });
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const savePlanBudgets = createAsyncThunk(
  'plans/saveBudgets',
  async ({ id, budgets }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/plans/${id}/budgets`, { budgets });
      return res.data.data.plan;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const now = new Date();

const initialState = {
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
    setSelectedPeriod(state, action) {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export const { setSelectedPeriod, clearPlanError } = planSlice.actions;
export default planSlice.reducer;
