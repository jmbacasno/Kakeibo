import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { ApiSuccessResponse, DashboardData } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  { month: number; year: number },
  { rejectValue: string }
>('dashboard/fetch', async ({ month, year }, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiSuccessResponse<DashboardData>>('/dashboard', {
      params: { month, year },
    });
    return res.data.data;
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
