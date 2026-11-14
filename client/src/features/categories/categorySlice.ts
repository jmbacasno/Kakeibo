import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { Category } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import {
  categoryService,
  CreateCategoryPayload,
  FetchCategoriesParams,
  ToggleCategoryStatusPayload,
  UpdateCategoryPayload,
} from './categoryService';

export type {
  CreateCategoryPayload,
  FetchCategoriesParams,
  ToggleCategoryStatusPayload,
  UpdateCategoryPayload,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  FetchCategoriesParams | undefined,
  { rejectValue: string }
>('categories/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    return await categoryService.fetchAll(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryPayload,
  { rejectValue: string }
>('categories/create', async (payload, { rejectWithValue }) => {
  try {
    return await categoryService.create(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  UpdateCategoryPayload,
  { rejectValue: string }
>('categories/update', async (payload, { rejectWithValue }) => {
  try {
    return await categoryService.update(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const toggleCategoryStatus = createAsyncThunk<
  Category,
  ToggleCategoryStatusPayload,
  { rejectValue: string }
>('categories/toggleStatus', async (payload, { rejectWithValue }) => {
  try {
    return await categoryService.toggleStatus(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteCategory = createAsyncThunk<number, number, { rejectValue: string }>(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.remove(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

interface CategoryState {
  items: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: CategoryState = {
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
        state.error = action.payload ?? 'Failed to load categories.';
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
