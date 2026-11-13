import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import {
  ApiSuccessResponse,
  CategoryType,
  PaginationMeta,
  Transaction,
} from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';

export interface TransactionFilters {
  type: '' | CategoryType;
  categoryId: string;
  startDate: string;
  endDate: string;
  search: string;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface FetchTransactionsParams extends Partial<TransactionFilters> {
  planId?: number;
}

export interface TransactionInputPayload {
  monthlyPlanId: number;
  categoryId: number;
  amount: number;
  description: string;
  transactionDate: string;
}

interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

export const fetchTransactions = createAsyncThunk<
  PaginatedTransactionsResponse,
  FetchTransactionsParams | undefined,
  { rejectValue: string }
>('transactions/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const cleanParams: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== '' && v !== null && v !== undefined) {
        cleanParams[k] = v;
      }
    }
    const res = await api.get<ApiSuccessResponse<PaginatedTransactionsResponse>>('/transactions', {
      params: cleanParams,
    });
    return res.data.data;
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
    const res = await api.post<ApiSuccessResponse<{ transaction: Transaction }>>(
      '/transactions',
      payload
    );
    return res.data.data.transaction;
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
    const res = await api.put<ApiSuccessResponse<{ transaction: Transaction }>>(
      `/transactions/${id}`,
      data
    );
    return res.data.data.transaction;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteTransaction = createAsyncThunk<number, number, { rejectValue: string }>(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
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
