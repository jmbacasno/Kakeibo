import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { UpdateUserSettingsPayload, UserSettings } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import { settingsService } from './settingsService';

export const fetchSettings = createAsyncThunk<UserSettings, void, { rejectValue: string }>(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsService.getSettings();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateSettings = createAsyncThunk<
  UserSettings,
  UpdateUserSettingsPayload,
  { rejectValue: string }
>('settings/update', async (payload, { rejectWithValue }) => {
  try {
    return await settingsService.updateSettings(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

interface SettingsState {
  data: UserSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load preferences.';
      })
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to save preferences.';
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default settingsSlice.reducer;
