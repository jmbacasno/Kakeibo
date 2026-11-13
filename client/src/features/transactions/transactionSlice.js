import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const cleanParams = {};
      for (const [k, v] of Object.entries(params)) {
        if (v !== '' && v !== null && v !== undefined) {
          cleanParams[k] = v;
        }
      }
      const res = await api.get('/transactions', { params: cleanParams });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/transactions', payload);
      return res.data.data.transaction;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/transactions/${id}`, data);
      return res.data.data.transaction;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  },
  filters: {
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 25,
  },
  loading: false,
  saving: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetTransactionFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTransaction.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTransaction.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTransaction.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export const { setTransactionFilters, resetTransactionFilters } = transactionSlice.actions;
export default transactionSlice.reducer;
