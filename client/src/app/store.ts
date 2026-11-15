import { configureStore, createListenerMiddleware, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import authReducer, { forceLogout, logoutUser } from '../features/auth/authSlice';
import categoryReducer from '../features/categories/categorySlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import noteReducer from '../features/notes/noteSlice';
import planReducer from '../features/plans/planSlice';
import reflectionReducer from '../features/reflections/reflectionSlice';
import settingsReducer, { fetchSettings, updateSettings } from '../features/settings/settingsSlice';
import themeReducer, { applyThemeToDom, setTheme } from '../features/theme/themeSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import { UserSettings } from '../types/models';
import { resetFormattingPreferences, setFormattingPreferences } from '../utils/formatters';

const preferencesListenerMiddleware = createListenerMiddleware();

preferencesListenerMiddleware.startListening({
  actionCreator: setTheme,
  effect: (action) => {
    applyThemeToDom(action.payload);
  },
});

const isSettingsSyncAction = (action: unknown): action is PayloadAction<UserSettings> =>
  fetchSettings.fulfilled.match(action) || updateSettings.fulfilled.match(action);

preferencesListenerMiddleware.startListening({
  matcher: isSettingsSyncAction,
  effect: (action, listenerApi) => {
    const userSettings = action.payload;
    setFormattingPreferences({
      currency: userSettings.currency,
      language: userSettings.language,
      dateFormat: userSettings.dateFormat,
    });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = userSettings.language;
    }

    const currentTheme = (listenerApi.getState() as { theme: { mode: string } }).theme.mode;
    if (currentTheme !== userSettings.theme) {
      listenerApi.dispatch(setTheme(userSettings.theme));
    }
  },
});

preferencesListenerMiddleware.startListening({
  matcher: isAnyOf(logoutUser.fulfilled, forceLogout),
  effect: () => {
    resetFormattingPreferences();
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en';
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: planReducer,
    categories: categoryReducer,
    transactions: transactionReducer,
    notes: noteReducer,
    reflections: reflectionReducer,
    dashboard: dashboardReducer,
    theme: themeReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(preferencesListenerMiddleware.middleware),
});

applyThemeToDom(store.getState().theme.mode);

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  colorSchemeQuery.addEventListener('change', () => {
    if (store.getState().theme.mode === 'system') {
      applyThemeToDom('system');
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
