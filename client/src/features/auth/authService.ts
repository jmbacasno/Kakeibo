import api, { getStoredToken, setStoredToken } from '../../services/api';
import { ApiSuccessResponse, User } from '../../types/models';

export interface AuthSessionResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
}

export async function register(payload: RegisterPayload): Promise<AuthSessionResponse> {
  const res = await api.post<ApiSuccessResponse<AuthSessionResponse>>('/auth/register', payload);
  setStoredToken(res.data.data.token);
  return res.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  const res = await api.post<ApiSuccessResponse<AuthSessionResponse>>('/auth/login', payload);
  setStoredToken(res.data.data.token);
  return res.data.data;
}

export async function fetchMe(): Promise<{ user: User }> {
  try {
    const res = await api.get<ApiSuccessResponse<{ user: User }>>('/auth/me');
    return res.data.data;
  } catch (err) {
    setStoredToken(null);
    throw err;
  }
}

export async function updateAccount(payload: UpdateAccountPayload): Promise<AuthSessionResponse> {
  const res = await api.put<ApiSuccessResponse<AuthSessionResponse>>('/auth/account', payload);
  setStoredToken(res.data.data.token);
  return res.data.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const res = await api.put<ApiSuccessResponse<{ message: string }>>('/auth/password', payload);
  return res.data.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore network errors on logout
  } finally {
    setStoredToken(null);
  }
}

export const authService = {
  register,
  login,
  fetchMe,
  updateAccount,
  changePassword,
  logout,
  getStoredToken,
  setStoredToken,
};

export default authService;
