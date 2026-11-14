import api from '../../services/api';
import { ApiSuccessResponse, MonthlyReflection } from '../../types/models';

export interface FetchReflectionsParams {
  planId?: number;
  month?: number;
  year?: number;
}

export interface CreateReflectionPayload {
  monthlyPlanId: number;
  content: string;
}

export interface UpdateReflectionPayload {
  id: number;
  content: string;
}

export async function fetchAll(params: FetchReflectionsParams = {}): Promise<MonthlyReflection[]> {
  const res = await api.get<ApiSuccessResponse<{ reflections: MonthlyReflection[] }>>(
    '/monthly-reflections',
    { params }
  );
  return res.data.data.reflections;
}

export async function create(payload: CreateReflectionPayload): Promise<MonthlyReflection> {
  const res = await api.post<ApiSuccessResponse<{ reflection: MonthlyReflection }>>(
    '/monthly-reflections',
    payload
  );
  return res.data.data.reflection;
}

export async function update({ id, content }: UpdateReflectionPayload): Promise<MonthlyReflection> {
  const res = await api.put<ApiSuccessResponse<{ reflection: MonthlyReflection }>>(
    `/monthly-reflections/${id}`,
    { content }
  );
  return res.data.data.reflection;
}

export async function remove(id: number): Promise<number> {
  await api.delete(`/monthly-reflections/${id}`);
  return id;
}

export const reflectionService = {
  fetchAll,
  create,
  update,
  remove,
};

export default reflectionService;
