import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { PaginationMeta, Transaction } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import {
  FetchTransactionsParams,
  PaginatedTransactionsResponse,
  transactionService,
  TransactionFilters,
  TransactionInputPayload,
} from './transactionService';

export type {
  FetchTransactionsParams,
  PaginatedTransactionsResponse,
  TransactionFilters,
  TransactionInputPayload,
};

export const fetchTransactions = createAsyncThunk<
  PaginatedTransactionsResponse,
  FetchTransactionsParams | undefined,
  { rejectValue: string }
>('transactions/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    return await transactionService.fetchAll(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createTransaction = createAsyncThunk<
  Transaction,
  TransactionInputPayload,
  { rejectValue: string }
>('transactions/create', async (payload, { rejectWithValue }) => {
  try {
    return await transactionService.create(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateTransaction = createAsyncThunk<
  Transaction,
  { id: number; data: Partial<TransactionInputPayload> },
  { rejectValue: string }
>('transactions/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await transactionService.update(id, data);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteTransaction = createAsyncThunk<number, number, { rejectValue: string }>(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await transactionService.remove(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

interface TransactionState {
  items: Transaction[];
  pagination: PaginationMeta;
  filters: TransactionFilters;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: TransactionState = {
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
    setTransactionFilters(state, action: PayloadAction<Partial<TransactionFilters>>) {
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
        state.error = action.payload ?? 'Failed to load transactions.';
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
