import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import { createNote, deleteNote, fetchNotes, updateNote } from '../features/notes/noteSlice';
import { fetchCurrentPlan } from '../features/plans/planSlice';
import { Note } from '../types/models';
import { formatDateTimeDisplay, formatMonthYear } from '../utils/formatters';

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, loading: planLoading } = useAppSelector(
    (state) => state.plans
  );
  const { items: notes, loading } = useAppSelector((state) => state.notes);

  const [scope, setScope] = useState<'month' | 'all'>('month');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentPlan({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const loadNotes = useCallback(() => {
    const params: { order: 'asc' | 'desc'; month?: number; year?: number } = { order };
    if (scope === 'month') {
      params.month = selectedMonth;
      params.year = selectedYear;
    }
    dispatch(fetchNotes(params));
  }, [dispatch, scope, order, selectedMonth, selectedYear]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const openCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!content.trim()) {
      setFormError('Please write something in your note.');
      return;
    }

    setSaving(true);
    if (editingNote) {
      const res = await dispatch(
        updateNote({
          id: editingNote.id,
          data: { title: title.trim() || null, content: content.trim() },
        })
      );
      setSaving(false);
      if (updateNote.fulfilled.match(res)) {
        toast.success('Note updated.');
        setModalOpen(false);
        loadNotes();
      } else {
        setFormError(res.payload || 'Unable to update note.');
      }
    } else {
      if (!currentPlan) {
        setSaving(false);
        setFormError('Create a monthly plan first before adding notes for this month.');
        return;
      }
      const res = await dispatch(
        createNote({
          monthlyPlanId: currentPlan.id,
          title: title.trim() || null,
          content: content.trim(),
        })
      );
      setSaving(false);
      if (createNote.fulfilled.match(res)) {
        toast.success('Note saved.');
        setModalOpen(false);
        loadNotes();
      } else {
        setFormError(res.payload || 'Unable to save note.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    setDeletingLoading(true);
    const res = await dispatch(deleteNote(deletingNote.id));
    setDeletingLoading(false);
    if (deleteNote.fulfilled.match(res)) {
      toast.success('Note deleted.');
      setDeletingNote(null);
    } else {
      toast.error(res.payload || 'Unable to delete note.');
    }
  };

  const showNoPlanForMonth = scope === 'month' && !planLoading && !currentPlan;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            {scope === 'month'
              ? `${formatMonthYear(selectedMonth, selectedYear)} Notes`
              : 'All Personal Notes'}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Informal financial thoughts, upcoming expenses, purchase considerations, and reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-subtle-strong rounded-lg">
            <button
              type="button"
              onClick={() => setScope('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scope === 'month'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Selected month
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scope === 'all'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All months
            </button>
          </div>

          <select
            aria-label="Sort notes order"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 text-xs font-medium bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
          >
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>

          {currentPlan && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Write note</span>
            </button>
          )}
        </div>
      </div>

      {showNoPlanForMonth ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Notes are kept inside each month's Kakeibo journal. Create a monthly plan for this period to start writing notes, or switch to All months."
          action={
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg"
            >
              Create monthly plan
            </Link>
          }
        />
      ) : loading ? (
        <CardSkeleton rows={4} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your notebook is quiet"
          description="Jot down upcoming expenses, things you want to pause and consider before buying, or personal reminders."
          action={
            currentPlan ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Write first note</span>
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className="bg-surface border border-line rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {note.title ? (
                      <h3 className="text-base font-semibold text-ink leading-snug">
                        {note.title}
                      </h3>
                    ) : (
                      <p className="text-xs font-medium text-ink-muted">
                        {note.monthlyPlan
                          ? formatMonthYear(note.monthlyPlan.month, note.monthlyPlan.year)
                          : 'Journal note'}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted mt-0.5 font-mono tabular-nums">
                      {note.monthlyPlan
                        ? `${formatMonthYear(note.monthlyPlan.month, note.monthlyPlan.year)} · `
                        : ''}
                      {formatDateTimeDisplay(note.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(note)}
                      aria-label="Edit note"
                      className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingNote(note)}
                      aria-label="Delete note"
                      className="p-1.5 rounded-lg text-ink-muted hover:text-danger-accent hover:bg-danger-bg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-ink-secondary whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit note' : 'Write a note'}
        subtitle={
          editingNote?.monthlyPlan
            ? formatMonthYear(editingNote.monthlyPlan.month, editingNote.monthlyPlan.year)
            : currentPlan
            ? formatMonthYear(currentPlan.month, currentPlan.year)
            : ''
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-danger-bg border border-danger-line px-3.5 py-2.5 text-sm text-danger">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="note-title" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Title (optional)
            </label>
            <input
              id="note-title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Autumn travel consideration"
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div>
            <label htmlFor="note-content" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Note
            </label>
            <textarea
              id="note-content"
              rows={6}
              maxLength={5000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely about upcoming costs, reminders, or spending thoughts..."
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder leading-relaxed focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingNote ? 'Save changes' : 'Save note'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleConfirmDelete}
        title="Delete note"
        message="Are you sure you want to delete this personal note? This action cannot be undone."
        loading={deletingLoading}
      />
    </div>
  );
}
