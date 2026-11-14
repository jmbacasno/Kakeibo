import api from '../../services/api';
import { ApiSuccessResponse, Note } from '../../types/models';

export interface FetchNotesParams {
  planId?: number;
  month?: number;
  year?: number;
  order?: 'asc' | 'desc';
}

export interface CreateNotePayload {
  monthlyPlanId: number;
  title?: string | null;
  content: string;
}

export interface UpdateNotePayload {
  id: number;
  data: {
    title?: string | null;
    content: string;
  };
}

export async function fetchAll(params: FetchNotesParams = {}): Promise<Note[]> {
  const res = await api.get<ApiSuccessResponse<{ notes: Note[] }>>('/notes', { params });
  return res.data.data.notes;
}

export async function create(payload: CreateNotePayload): Promise<Note> {
  const res = await api.post<ApiSuccessResponse<{ note: Note }>>('/notes', payload);
  return res.data.data.note;
}

export async function update({ id, data }: UpdateNotePayload): Promise<Note> {
  const res = await api.put<ApiSuccessResponse<{ note: Note }>>(`/notes/${id}`, data);
  return res.data.data.note;
}

export async function remove(id: number): Promise<number> {
  await api.delete(`/notes/${id}`);
  return id;
}

export const noteService = {
  fetchAll,
  create,
  update,
  remove,
};

export default noteService;
