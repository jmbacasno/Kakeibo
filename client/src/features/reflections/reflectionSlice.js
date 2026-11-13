import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchReflections = createAsyncThunk(
  'reflections/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/monthly-reflections', { params });
      return res.data.data.reflections;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createReflection = createAsyncThunk(
  'reflections/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/monthly-reflections', payload);
      return res.data.data.reflection;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateReflection = createAsyncThunk(
  'reflections/update',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/monthly-reflections/${id}`, { content });
      return res.data.data.reflection;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReflection = createAsyncThunk(
  'reflections/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/monthly-reflections/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

const reflectionSlice = createSlice({
  name: 'reflections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReflections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReflections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReflections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReflection.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateReflection.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteReflection.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default reflectionSlice.reducer;
