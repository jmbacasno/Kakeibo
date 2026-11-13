import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories', { params });
      return res.data.data.categories;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/categories', payload);
      return res.data.data.category;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, { name });
      return res.data.data.category;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  'categories/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/categories/${id}/status`, { isActive });
      return res.data.data.category;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
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

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default categorySlice.reducer;
