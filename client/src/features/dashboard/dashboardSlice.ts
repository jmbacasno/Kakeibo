import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { DashboardData } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import { dashboardService, FetchDashboardParams } from './dashboardService';

export type { FetchDashboardParams };

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  FetchDashboardParams,
  { rejectValue: string }
>('dashboard/fetch', async (params, { rejectWithValue }) => {
  try {
    return await dashboardService.fetchSummary(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load dashboard.';
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default dashboardSlice.reducer;
