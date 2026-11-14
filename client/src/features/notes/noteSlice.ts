import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../services/api';
import { Note } from '../../types/models';
import { forceLogout, logoutUser } from '../auth/authSlice';
import {
  CreateNotePayload,
  FetchNotesParams,
  noteService,
  UpdateNotePayload,
} from './noteService';

export type { CreateNotePayload, FetchNotesParams, UpdateNotePayload };

export const fetchNotes = createAsyncThunk<
  Note[],
  FetchNotesParams | undefined,
  { rejectValue: string }
>('notes/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    return await noteService.fetchAll(params);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createNote = createAsyncThunk<Note, CreateNotePayload, { rejectValue: string }>(
  'notes/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await noteService.create(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateNote = createAsyncThunk<Note, UpdateNotePayload, { rejectValue: string }>(
  'notes/update',
  async (payload, { rejectWithValue }) => {
    try {
      return await noteService.update(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteNote = createAsyncThunk<number, number, { rejectValue: string }>(
  'notes/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await noteService.remove(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

interface NoteState {
  items: Note[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: NoteState = {
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
        state.error = action.payload ?? 'Failed to load notes.';
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
