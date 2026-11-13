import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Archive, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ConfirmDialog from '../components/ConfirmDialog';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  toggleCategoryStatus,
  updateCategory,
} from '../features/categories/categorySlice';
import { Category, CategoryType } from '../types/models';
import { KAKEIBO_PILLAR_META } from '../utils/formatters';

type CategoryTypeFilter = 'ALL' | CategoryType;

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { items: categories, loading } = useAppSelector((state) => state.categories);

  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<CategoryType>('EXPENSE');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
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
    setCatType(defaultType);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!catName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSaving(true);
    if (editingCat) {
      const res = await dispatch(
        updateCategory({ id: editingCat.id, name: catName.trim() })
      );
      setSaving(false);
      if (updateCategory.fulfilled.match(res)) {
        toast.success('Category renamed.');
        setModalOpen(false);
      } else {
        setFormError(res.payload || 'Unable to rename category.');
      }
    } else {
      const res = await dispatch(
        createCategory({ name: catName.trim(), type: catType })
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

  const handleToggleStatus = async (cat: Category) => {
    const nextActive = !cat.isActive;
    const res = await dispatch(
      toggleCategoryStatus({ id: cat.id, isActive: nextActive })
    );
    if (toggleCategoryStatus.fulfilled.match(res)) {
      toast.success(
        nextActive
          ? `"${cat.name}" activated.`
          : `"${cat.name}" archived. Historical records remain intact.`
      );
    } else {
      toast.error(res.payload || 'Unable to update category status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCat) return;
    setDeletingLoading(true);
    const res = await dispatch(deleteCategory(deletingCat.id));
    setDeletingLoading(false);
    if (deleteCategory.fulfilled.match(res)) {
      toast.success(`Category "${deletingCat.name}" deleted.`);
      setDeletingCat(null);
    } else {
      toast.error(res.payload || 'Unable to delete category.');
    }
  };

  const renderSection = (title: string, subtitle: string, list: Category[]) => (
    <section className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E2DC] flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1C1B18]">{title}</h3>
          <p className="text-xs text-[#6B675E] mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-mono tabular-nums text-[#6B675E]">
          {list.filter((c) => c.isActive).length} active · {list.length} total
        </span>
      </div>

      <div className="divide-y divide-[#E5E2DC]">
        {list.map((cat) => {
          const pillar = KAKEIBO_PILLAR_META[cat.name];
          const txCount = cat._count?.transactions || 0;
          const budgetCount = cat._count?.categoryBudgets || 0;
          const isInUse = txCount > 0 || budgetCount > 0;

          return (
            <div
              key={cat.id}
              className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !cat.isActive ? 'bg-[#FAF9F6]/70' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      cat.isActive ? 'text-[#1C1B18]' : 'text-[#6B675E] line-through'
                    }`}
                  >
                    {cat.name}
                  </span>
                  {pillar && (
                    <span className="text-xs text-[#6B675E]">· {pillar.jp}</span>
                  )}
                  <span className="text-xs text-[#6B675E]">
                    · {cat.isDefault ? 'Default' : 'Custom'}
                  </span>
                  {!cat.isActive && (
                    <span className="text-xs text-[#B4690E] font-medium">· Archived</span>
                  )}
                </div>

                <p className="text-xs text-[#6B675E] mt-0.5">
                  {pillar ? `${pillar.description} · ` : ''}
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(cat)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors whitespace-nowrap"
                >
                  {cat.isActive ? (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>

                {!isInUse && (
                  <button
                    type="button"
                    onClick={() => setDeletingCat(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#B83B3B] bg-white border border-[#E8C5C5] rounded-lg hover:bg-[#FDF6F6] transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B18]">Categories</h2>
          <p className="text-xs text-[#6B675E] mt-1">
            Organize income sources and expense pillars. Archive categories to keep past records intact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-[#EAE7E0] rounded-lg">
            {(['ALL', 'EXPENSE', 'INCOME'] as CategoryTypeFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab
                    ? 'bg-white text-[#1C1B18] shadow-xs'
                    : 'text-[#6B675E] hover:text-[#1C1B18]'
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
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
        title={editingCat ? 'Rename category' : 'Create custom category'}
        subtitle={
          editingCat
            ? `Category type (${editingCat.type.toLowerCase()}) cannot be changed after creation.`
            : 'Add a new income or expense category to your ledger.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] px-3.5 py-2.5 text-sm text-[#8F2A2A]">
              {formError}
            </div>
          )}

          {!editingCat && (
            <div>
              <span className="block text-xs font-medium text-[#4A4740] mb-1.5">
                Category type
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F1EFEA] rounded-lg">
                <button
                  type="button"
                  onClick={() => setCatType('EXPENSE')}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${
                    catType === 'EXPENSE'
                      ? 'bg-white text-[#1C1B18] shadow-xs'
                      : 'text-[#6B675E] hover:text-[#1C1B18]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setCatType('INCOME')}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${
                    catType === 'INCOME'
                      ? 'bg-white text-[#1C1B18] shadow-xs'
                      : 'text-[#6B675E] hover:text-[#1C1B18]'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="cat-name" className="block text-xs font-medium text-[#4A4740] mb-1.5">
              Category name
            </label>
            <input
              id="cat-name"
              type="text"
              maxLength={50}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder={catType === 'EXPENSE' ? 'e.g., Groceries' : 'e.g., Consulting'}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#355482] hover:bg-[#29436A] rounded-lg disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingCat ? 'Save name' : 'Create category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingCat)}
        onClose={() => setDeletingCat(null)}
        onConfirm={handleConfirmDelete}
        title="Delete category"
        message={
          deletingCat
            ? `Delete "${deletingCat.name}"? This category has no transactions or budgets and will be permanently removed.`
            : ''
        }
        loading={deletingLoading}
      />
    </div>
  );
}
