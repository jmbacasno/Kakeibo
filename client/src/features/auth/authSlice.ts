import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { User } from '../../types/models';
import {
  authService,
  AuthSessionResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateAccountPayload,
} from './authService';

export type {
  AuthSessionResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateAccountPayload,
};

export const registerUser = createAsyncThunk<AuthSessionResponse, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.register(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loginUser = createAsyncThunk<AuthSessionResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<{ user: User }, void, { rejectValue: string }>(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchMe();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateAccountDetails = createAsyncThunk<
  AuthSessionResponse,
  UpdateAccountPayload,
  { rejectValue: string }
>('auth/updateAccount', async (payload, { rejectWithValue }) => {
  try {
    return await authService.updateAccount(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const changeAccountPassword = createAsyncThunk<
  { message: string },
  ChangePasswordPayload,
  { rejectValue: string }
>('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    return await authService.changePassword(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  await authService.logout();
});

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  savingAccount: boolean;
  savingPassword: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: authService.getStoredToken(),
  isAuthenticated: false,
  initialized: !authService.getStoredToken(),
  loading: false,
  savingAccount: false,
  savingPassword: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    forceLogout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.initialized = true;
      authService.setStoredToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to register.';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to sign in.';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(updateAccountDetails.pending, (state) => {
        state.savingAccount = true;
      })
      .addCase(updateAccountDetails.fulfilled, (state, action) => {
        state.savingAccount = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(updateAccountDetails.rejected, (state) => {
        state.savingAccount = false;
      })
      .addCase(changeAccountPassword.pending, (state) => {
        state.savingPassword = true;
      })
      .addCase(changeAccountPassword.fulfilled, (state) => {
        state.savingPassword = false;
      })
      .addCase(changeAccountPassword.rejected, (state) => {
        state.savingPassword = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true;
        state.error = null;
      });
  },
});

export const { clearAuthError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
