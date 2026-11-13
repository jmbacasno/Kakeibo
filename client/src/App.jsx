import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, forceLogout } from './features/auth/authSlice.js';
import { registerUnauthorizedHandler } from './services/api.js';
import { ToastProvider } from './components/ToastProvider.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MonthlyPlanPage from './pages/MonthlyPlanPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import ReflectionsPage from './pages/ReflectionsPage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      dispatch(forceLogout());
    });
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
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
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
