import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { MonthlyReflection } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import {
  CreateReflectionPayload,
  FetchReflectionsParams,
  reflectionService,
  UpdateReflectionPayload,
} from './reflectionService';

export type {
  CreateReflectionPayload,
  FetchReflectionsParams,
  UpdateReflectionPayload,
};

export const fetchReflections = createAsyncThunk<
  MonthlyReflection[],
  FetchReflectionsParams | undefined,
  { rejectValue: string }
>('reflections/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    return await reflectionService.fetchAll(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createReflection = createAsyncThunk<
  MonthlyReflection,
  CreateReflectionPayload,
  { rejectValue: string }
>('reflections/create', async (payload, { rejectWithValue }) => {
  try {
    return await reflectionService.create(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateReflection = createAsyncThunk<
  MonthlyReflection,
  UpdateReflectionPayload,
  { rejectValue: string }
>('reflections/update', async (payload, { rejectWithValue }) => {
  try {
    return await reflectionService.update(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteReflection = createAsyncThunk<number, number, { rejectValue: string }>(
  'reflections/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await reflectionService.remove(id);
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
