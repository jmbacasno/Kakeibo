import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import categoryReducer from '../features/categories/categorySlice.js';
import dashboardReducer from '../features/dashboard/dashboardSlice.js';
import noteReducer from '../features/notes/noteSlice.js';
import planReducer from '../features/plans/planSlice.js';
import reflectionReducer from '../features/reflections/reflectionSlice.js';
import transactionReducer from '../features/transactions/transactionSlice.js';

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
