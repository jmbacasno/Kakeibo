import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { ApiSuccessResponse, MonthlyReflection } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';

export interface FetchReflectionsParams {
  planId?: number;
  month?: number;
  year?: number;
}

export const fetchReflections = createAsyncThunk<
  MonthlyReflection[],
  FetchReflectionsParams | undefined,
  { rejectValue: string }
>('reflections/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiSuccessResponse<{ reflections: MonthlyReflection[] }>>(
      '/monthly-reflections',
      { params }
    );
    return res.data.data.reflections;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createReflection = createAsyncThunk<
  MonthlyReflection,
  { monthlyPlanId: number; content: string },
  { rejectValue: string }
>('reflections/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiSuccessResponse<{ reflection: MonthlyReflection }>>(
      '/monthly-reflections',
      payload
    );
    return res.data.data.reflection;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateReflection = createAsyncThunk<
  MonthlyReflection,
  { id: number; content: string },
  { rejectValue: string }
>('reflections/update', async ({ id, content }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiSuccessResponse<{ reflection: MonthlyReflection }>>(
      `/monthly-reflections/${id}`,
      { content }
    );
    return res.data.data.reflection;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteReflection = createAsyncThunk<number, number, { rejectValue: string }>(
  'reflections/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/monthly-reflections/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

interface ReflectionState {
  items: MonthlyReflection[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ReflectionState = {
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
        state.error = action.payload ?? 'Failed to load reflections.';
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
