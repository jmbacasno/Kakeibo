import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { ApiSuccessResponse, Category, CategoryType } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';

export interface FetchCategoriesParams {
  type?: CategoryType;
  isActive?: boolean;
}

export const fetchCategories = createAsyncThunk<
  Category[],
  FetchCategoriesParams | undefined,
  { rejectValue: string }
>('categories/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiSuccessResponse<{ categories: Category[] }>>('/categories', {
      params,
    });
    return res.data.data.categories;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createCategory = createAsyncThunk<
  Category,
  { name: string; type: CategoryType },
  { rejectValue: string }
>('categories/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiSuccessResponse<{ category: Category }>>('/categories', payload);
    return res.data.data.category;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: number; name: string },
  { rejectValue: string }
>('categories/update', async ({ id, name }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiSuccessResponse<{ category: Category }>>(`/categories/${id}`, {
      name,
    });
    return res.data.data.category;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const toggleCategoryStatus = createAsyncThunk<
  Category,
  { id: number; isActive: boolean },
  { rejectValue: string }
>('categories/toggleStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const res = await api.patch<ApiSuccessResponse<{ category: Category }>>(
      `/categories/${id}/status`,
      { isActive }
    );
    return res.data.data.category;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteCategory = createAsyncThunk<number, number, { rejectValue: string }>(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
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
