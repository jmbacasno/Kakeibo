import api from '../../services/api';
import {
  ApiSuccessResponse,
  UpdateUserSettingsPayload,
  UserSettings,
} from '../../types/models';

export async function getSettings(): Promise<UserSettings> {
  const res = await api.get<ApiSuccessResponse<{ settings: UserSettings }>>('/settings');
  return res.data.data.settings;
}

export async function updateSettings(
  payload: UpdateUserSettingsPayload
): Promise<UserSettings> {
  const res = await api.put<ApiSuccessResponse<{ settings: UserSettings }>>(
    '/settings',
    payload
  );
  return res.data.data.settings;
}

export const settingsService = {
  getSettings,
  updateSettings,
};

export default settingsService;
