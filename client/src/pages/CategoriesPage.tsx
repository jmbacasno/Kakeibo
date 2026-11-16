import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../features/categories/categorySlice';
import { Category, CategoryType } from '../types/models';

type CategoryTypeFilter = 'ALL' | CategoryType;

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { items: categories, loading } = useAppSelector((state) => state.categories);

  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catType, setCatType] = useState<CategoryType>('EXPENSE');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories]
  );

  const openCreateModal = (defaultType: CategoryType = 'EXPENSE') => {
    setEditingCat(null);
    setCatName('');
    setCatDescription('');
    setCatType(defaultType);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatType(cat.type);
    setFormError('');
    setModalOpen(true);
  };

  const openDeleteModal = (cat: Category) => {
    setDeletingCat(cat);
    setDeleteConfirmName('');
  };

  const closeDeleteModal = () => {
    if (deletingLoading) return;
    setDeletingCat(null);
    setDeleteConfirmName('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!catName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const normalizedDescription = catDescription.trim() ? catDescription.trim() : null;

    setSaving(true);
    if (editingCat) {
      const res = await dispatch(
        updateCategory({
          id: editingCat.id,
          name: catName.trim(),
          description: normalizedDescription,
        })
      );
      setSaving(false);
      if (updateCategory.fulfilled.match(res)) {
        toast.success('Category updated.');
        setModalOpen(false);
      } else {
        setFormError(res.payload || 'Unable to update category.');
      }
    } else {
      const res = await dispatch(
        createCategory({
          name: catName.trim(),
          description: normalizedDescription,
          type: catType,
        })
      );
      setSaving(false);
      if (createCategory.fulfilled.match(res)) {
        toast.success(`Category "${res.payload.name}" created.`);
        setModalOpen(false);
      } else {
        setFormError(res.payload || 'Unable to create category.');
      }
    }
  };

  const handleConfirmDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (!deletingCat) return;
    if (deleteConfirmName.trim() !== deletingCat.name) return;

    setDeletingLoading(true);
    const res = await dispatch(deleteCategory(deletingCat.id));
    setDeletingLoading(false);
    if (deleteCategory.fulfilled.match(res)) {
      toast.success(`Category "${deletingCat.name}" deleted.`);
      setDeletingCat(null);
      setDeleteConfirmName('');
    } else {
      toast.error(res.payload || 'Unable to delete category.');
    }
  };

  const renderSection = (title: string, subtitle: string, list: Category[]) => (
    <section className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-line flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-mono tabular-nums text-ink-muted">
          {list.length} {list.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="px-6 py-8 text-xs text-ink-muted text-center">
          No categories in this group yet.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {list.map((cat) => {
            const txCount = cat._count?.transactions || 0;
            const budgetCount = cat._count?.categoryBudgets || 0;

            return (
              <div
                key={cat.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">{cat.name}</span>
                  </div>

                  <p className="text-xs text-ink-muted mt-0.5">
                    {cat.description ? `${cat.description} · ` : ''}
                    <span className="font-mono tabular-nums">
                      {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
                      {cat.type === 'EXPENSE'
                        ? ` · ${budgetCount} ${budgetCount === 1 ? 'budget' : 'budgets'}`
                        : ''}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-danger-accent bg-surface border border-danger-line rounded-lg hover:bg-danger-bg transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const deleteTxCount = deletingCat?._count?.transactions || 0;
  const deleteBudgetCount = deletingCat?._count?.categoryBudgets || 0;
  const canConfirmDelete = Boolean(
    deletingCat && deleteConfirmName.trim() === deletingCat.name
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Categories</h2>
          <p className="text-xs text-ink-muted mt-1">
            Organize income sources and expense categories for your monthly budgets and ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-subtle-strong rounded-lg">
            {(['ALL', 'EXPENSE', 'INCOME'] as CategoryTypeFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'EXPENSE' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              openCreateModal(typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE')
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New category</span>
          </button>
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <CardSkeleton rows={5} />
      ) : (
        <div className="space-y-6">
          {(typeFilter === 'ALL' || typeFilter === 'EXPENSE') &&
            renderSection(
              'Expense Categories',
              'Used for budget allocations and daily spending entries',
              expenseCategories
            )}

          {(typeFilter === 'ALL' || typeFilter === 'INCOME') &&
            renderSection(
              'Income Categories',
              'Used to classify incoming salary, business, and other earnings',
              incomeCategories
            )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCat ? 'Edit category' : 'Create category'}
        subtitle={
          editingCat
            ? `Category type (${editingCat.type.toLowerCase()}) cannot be changed after creation.`
            : 'Add a new income or expense category to your ledger.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-danger-bg border border-danger-line px-3.5 py-2.5 text-sm text-danger">
              {formError}
            </div>
          )}

          {!editingCat && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Category type
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-subtle rounded-lg">
                <button
                  type="button"
                  onClick={() => setCatType('EXPENSE')}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${
                    catType === 'EXPENSE'
                      ? 'bg-surface text-ink shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setCatType('INCOME')}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${
                    catType === 'INCOME'
                      ? 'bg-surface text-ink shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="cat-name" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Category name
            </label>
            <input
              id="cat-name"
              type="text"
              maxLength={50}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder={catType === 'EXPENSE' ? 'e.g., Groceries' : 'e.g., Consulting'}
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div>
            <label
              htmlFor="cat-description"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Description (optional)
            </label>
            <textarea
              id="cat-description"
              rows={2}
              maxLength={255}
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder="Brief note on what belongs in this category"
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15 resize-none"
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
              {saving ? 'Saving...' : editingCat ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingCat)}
        onClose={closeDeleteModal}
        title="Delete category"
        maxWidth="max-w-md"
      >
        {deletingCat && (
          <form onSubmit={handleConfirmDelete} className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-danger-bg border border-danger-line p-3.5">
              <AlertTriangle className="w-4 h-4 text-danger-accent shrink-0 mt-0.5" />
              <div className="text-sm text-ink-secondary space-y-1.5 leading-relaxed">
                <p>
                  You are about to permanently delete{' '}
                  <span className="font-semibold text-ink">{deletingCat.name}</span>.
                </p>
                <p className="text-xs font-mono tabular-nums text-danger">
                  Associated records: {deleteBudgetCount}{' '}
                  {deleteBudgetCount === 1 ? 'budget' : 'budgets'} · {deleteTxCount}{' '}
                  {deleteTxCount === 1 ? 'transaction' : 'transactions'}
                </p>
                {(deleteBudgetCount > 0 || deleteTxCount > 0) && (
                  <p className="text-xs text-danger">
                    All {deleteBudgetCount} {deleteBudgetCount === 1 ? 'budget' : 'budgets'} and{' '}
                    {deleteTxCount} {deleteTxCount === 1 ? 'transaction' : 'transactions'} linked
                    to this category will also be permanently deleted.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="delete-confirm-name"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Write category name to delete
              </label>
              <input
                id="delete-confirm-name"
                type="text"
                autoComplete="off"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={deletingCat.name}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-danger-accent focus:ring-2 focus:ring-danger-accent/15"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingLoading}
                className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deletingLoading || !canConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-danger-accent hover:bg-danger-hover rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingLoading ? 'Deleting...' : 'Delete category'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
