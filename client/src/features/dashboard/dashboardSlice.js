import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await api.get('/dashboard', { params: { month, year } });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
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
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default dashboardSlice.reducer;
