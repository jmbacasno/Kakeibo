import api from '../../services/api';
import { ApiSuccessResponse, Category, CategoryType } from '../../types/models';

export interface FetchCategoriesParams {
  type?: CategoryType;
  isActive?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryPayload {
  id: number;
  name: string;
}

export interface ToggleCategoryStatusPayload {
  id: number;
  isActive: boolean;
}

export async function fetchAll(params: FetchCategoriesParams = {}): Promise<Category[]> {
  const res = await api.get<ApiSuccessResponse<{ categories: Category[] }>>('/categories', {
    params,
  });
  return res.data.data.categories;
}

export async function create(payload: CreateCategoryPayload): Promise<Category> {
  const res = await api.post<ApiSuccessResponse<{ category: Category }>>('/categories', payload);
  return res.data.data.category;
}

export async function update({ id, name }: UpdateCategoryPayload): Promise<Category> {
  const res = await api.put<ApiSuccessResponse<{ category: Category }>>(`/categories/${id}`, {
    name,
  });
  return res.data.data.category;
}

export async function toggleStatus({ id, isActive }: ToggleCategoryStatusPayload): Promise<Category> {
  const res = await api.patch<ApiSuccessResponse<{ category: Category }>>(
    `/categories/${id}/status`,
    { isActive }
  );
  return res.data.data.category;
}

export async function remove(id: number): Promise<number> {
  await api.delete(`/categories/${id}`);
  return id;
}

export const categoryService = {
  fetchAll,
  create,
  update,
  toggleStatus,
  remove,
};

export default categoryService;
