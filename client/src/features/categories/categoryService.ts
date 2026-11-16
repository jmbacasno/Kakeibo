import api from '../../services/api';
import { ApiSuccessResponse, Category, CategoryType } from '../../types/models';

export interface FetchCategoriesParams {
  type?: CategoryType;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  type: CategoryType;
}

export interface UpdateCategoryPayload {
  id: number;
  name: string;
  description?: string | null;
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

export async function update({ id, name, description }: UpdateCategoryPayload): Promise<Category> {
  const res = await api.put<ApiSuccessResponse<{ category: Category }>>(`/categories/${id}`, {
    name,
    description: description ?? null,
  });
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
  remove,
};

export default categoryService;
