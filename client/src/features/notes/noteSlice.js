import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { logoutUser, forceLogout } from '../auth/authSlice.js';

export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/notes', { params });
      return res.data.data.notes;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/notes', payload);
      return res.data.data.note;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/notes/${id}`, data);
      return res.data.data.note;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload);
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export default noteSlice.reducer;
