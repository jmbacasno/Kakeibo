import api from '../../services/api';
import {
  ApiSuccessResponse,
  CategoryType,
  PaginationMeta,
  Transaction,
} from '../../types/models';

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

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

export async function fetchAll(
  params: FetchTransactionsParams = {}
): Promise<PaginatedTransactionsResponse> {
  const cleanParams: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleanParams[key] = value;
    }
  }
  const res = await api.get<ApiSuccessResponse<PaginatedTransactionsResponse>>('/transactions', {
    params: cleanParams,
  });
  return res.data.data;
}

export async function create(payload: TransactionInputPayload): Promise<Transaction> {
  const res = await api.post<ApiSuccessResponse<{ transaction: Transaction }>>(
    '/transactions',
    payload
  );
  return res.data.data.transaction;
}

export async function update(
  id: number,
  data: Partial<TransactionInputPayload>
): Promise<Transaction> {
  const res = await api.put<ApiSuccessResponse<{ transaction: Transaction }>>(
    `/transactions/${id}`,
    data
  );
  return res.data.data.transaction;
}

export async function remove(id: number): Promise<number> {
  await api.delete(`/transactions/${id}`);
  return id;
}

export const transactionService = {
  fetchAll,
  create,
  update,
  remove,
};

export default transactionService;
