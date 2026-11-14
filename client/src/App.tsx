import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { ToastProvider } from './components/ToastProvider';
import { fetchCurrentUser, forceLogout } from './features/auth/authSlice';
import { fetchSettings } from './features/settings/settingsSlice';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import MonthlyPlanPage from './pages/MonthlyPlanPage';
import NotesPage from './pages/NotesPage';
import ReflectionsPage from './pages/ReflectionsPage';
import SettingsPage from './pages/SettingsPage';
import TransactionsPage from './pages/TransactionsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { registerUnauthorizedHandler } from './services/api';

export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      dispatch(forceLogout());
    });
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
      dispatch(fetchSettings());
    }
  }, [dispatch, token]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/plan" element={<MonthlyPlanPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/reflections" element={<ReflectionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
