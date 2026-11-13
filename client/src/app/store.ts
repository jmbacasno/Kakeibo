import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import categoryReducer from '../features/categories/categorySlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import noteReducer from '../features/notes/noteSlice';
import planReducer from '../features/plans/planSlice';
import reflectionReducer from '../features/reflections/reflectionSlice';
import transactionReducer from '../features/transactions/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: planReducer,
    categories: categoryReducer,
    transactions: transactionReducer,
    notes: noteReducer,
    reflections: reflectionReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
