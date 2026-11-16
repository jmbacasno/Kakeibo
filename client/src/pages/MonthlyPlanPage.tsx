import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import { fetchCategories } from '../features/categories/categorySlice';
import {
  createPlan,
  fetchCurrentPlan,
  fetchPlans,
  setSelectedPeriod,
  updatePlan,
} from '../features/plans/planSlice';
import { Category, MonthlyPlan } from '../types/models';
import {
  formatCurrency,
  formatMonthYear,
  KAKEIBO_PILLAR_META,
  MONTH_NAMES,
} from '../utils/formatters';

interface AddedBudgetDraft {
  categoryId: number;
  allocatedAmount: string;
}

interface PlanEditorFormProps {
  selectedMonth: number;
  selectedYear: number;
  currentPlan: MonthlyPlan | null;
  expenseCategories: Category[];
  saving: boolean;
}

function PlanEditorForm({
  selectedMonth,
  selectedYear,
  currentPlan,
  expenseCategories,
  saving,
}: PlanEditorFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const activeCurrency = useAppSelector((state) => state.settings.data?.currency || 'USD');
  const isZeroDecimal = activeCurrency === 'JPY';

  const [plannedIncome, setPlannedIncome] = useState<string>(
    currentPlan ? String(currentPlan.plannedIncome ?? 0) : ''
  );
  const [savingsGoal, setSavingsGoal] = useState<string>(
    currentPlan ? String(currentPlan.savingsGoal ?? 0) : ''
  );
  const [addedBudgets, setAddedBudgets] = useState<AddedBudgetDraft[]>(() =>
    (currentPlan?.budgets || []).map((b) => ({
      categoryId: b.categoryId,
      allocatedAmount: String(b.allocatedAmount),
    }))
  );
  const [formError, setFormError] = useState('');

  // Modal state for "New Category Budget"
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<string>('');
  const [modalAllocatedAmount, setModalAllocatedAmount] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>();
    for (const cat of expenseCategories) {
      map.set(cat.id, cat);
    }
    for (const b of currentPlan?.budgets || []) {
      if (b.category && !map.has(b.categoryId)) {
        map.set(b.categoryId, b.category);
      }
    }
    return map;
  }, [expenseCategories, currentPlan]);

  const unaddedExpenseCategories = useMemo(() => {
    const addedIds = new Set(addedBudgets.map((b) => b.categoryId));
    return expenseCategories.filter((c) => !addedIds.has(c.id));
  }, [expenseCategories, addedBudgets]);

  const openNewBudgetModal = () => {
    setModalError('');
    const firstAvailable = unaddedExpenseCategories[0];
    setModalCategoryId(firstAvailable ? String(firstAvailable.id) : '');
    setModalAllocatedAmount('');
    setBudgetModalOpen(true);
  };

  const handleAddCategoryBudget = (e: FormEvent) => {
    e.preventDefault();
    setModalError('');

    const catIdNum = Number(modalCategoryId);
    if (!modalCategoryId || !Number.isInteger(catIdNum) || catIdNum <= 0) {
      setModalError('Please select a category.');
      return;
    }
    if (addedBudgets.some((b) => b.categoryId === catIdNum)) {
      setModalError('This category is already in your budget list.');
      return;
    }

    const parsedAmount = Number(modalAllocatedAmount === '' ? NaN : modalAllocatedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setModalError('Allocated amount must be 0 or greater.');
      return;
    }

    setAddedBudgets((prev) => [
      ...prev,
      { categoryId: catIdNum, allocatedAmount: String(parsedAmount) },
    ]);
    setBudgetModalOpen(false);
  };

  const handleUpdateBudgetAmount = (categoryId: number, value: string) => {
    setAddedBudgets((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId ? { ...item, allocatedAmount: value } : item
      )
    );
  };

  const handleRemoveBudget = (categoryId: number) => {
    setAddedBudgets((prev) => prev.filter((item) => item.categoryId !== categoryId));
  };

  const reviewMetrics = useMemo(() => {
    const toCents = (v: string | number) => Math.round((Number(v) || 0) * 100);
    const incomeCents = toCents(plannedIncome);
    const goalCents = toCents(savingsGoal);
    const availableCents = incomeCents - goalCents;

    let allocatedCents = 0;
    for (const item of addedBudgets) {
      allocatedCents += Math.max(0, toCents(item.allocatedAmount));
    }

    const differenceCents = allocatedCents - availableCents;
    return {
      plannedIncome: incomeCents / 100,
      savingsGoal: goalCents / 100,
      plannedAvailable: availableCents / 100,
      totalAllocated: allocatedCents / 100,
      difference: differenceCents / 100,
      exceedsAvailable: differenceCents > 0,
    };
  }, [plannedIncome, savingsGoal, addedBudgets]);

  const handleSavePlan = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const incVal = Number(plannedIncome || 0);
    const goalVal = Number(savingsGoal || 0);
    if (!Number.isFinite(incVal) || incVal < 0) {
      setFormError('Planned income must be 0 or greater.');
      return;
    }
    if (!Number.isFinite(goalVal) || goalVal < 0) {
      setFormError('Savings goal must be 0 or greater.');
      return;
    }

    const budgetsPayload: Array<{ categoryId: number; allocatedAmount: number }> = [];
    for (const item of addedBudgets) {
      const cat = categoryById.get(item.categoryId);
      const amt = Number(item.allocatedAmount === '' ? 0 : item.allocatedAmount);
      if (!Number.isFinite(amt) || amt < 0) {
        setFormError(`Budget for "${cat?.name || 'category'}" cannot be negative.`);
        return;
      }
      budgetsPayload.push({ categoryId: item.categoryId, allocatedAmount: amt });
    }

    if (currentPlan) {
      const res = await dispatch(
        updatePlan({
          id: currentPlan.id,
          data: {
            plannedIncome: incVal,
            savingsGoal: goalVal,
            budgets: budgetsPayload,
          },
        })
      );
      if (updatePlan.fulfilled.match(res)) {
        toast.success(`Updated plan for ${formatMonthYear(selectedMonth, selectedYear)}.`);
        dispatch(fetchPlans());
      } else {
        setFormError(res.payload || 'Unable to update monthly plan.');
      }
    } else {
      const res = await dispatch(
        createPlan({
          month: selectedMonth,
          year: selectedYear,
          plannedIncome: incVal,
          savingsGoal: goalVal,
          budgets: budgetsPayload,
        })
      );
      if (createPlan.fulfilled.match(res)) {
        toast.success(`Created plan for ${formatMonthYear(selectedMonth, selectedYear)}.`);
        dispatch(fetchPlans());
      } else {
        setFormError(res.payload || 'Unable to create monthly plan.');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSavePlan} className="grid grid-cols-1 lg:grid-cols-12 gap-6" noValidate>
        <div className="lg:col-span-8 space-y-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger"
            >
              {formError}
            </div>
          )}

          <section className="bg-surface border border-line rounded-xl p-6 space-y-5">
            <div className="border-b border-line pb-4">
              <h3 className="text-sm font-semibold text-ink">
                01. Income &amp; Savings Intention
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Define how much you expect to receive and how much you aim to keep.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="planned-income"
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  Expected monthly income ({activeCurrency})
                </label>
                <input
                  id="planned-income"
                  type="number"
                  step={isZeroDecimal ? '1' : '0.01'}
                  min="0"
                  value={plannedIncome}
                  onChange={(e) => setPlannedIncome(e.target.value)}
                  placeholder={isZeroDecimal ? '0' : '0.00'}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                />
              </div>

              <div>
                <label
                  htmlFor="savings-goal"
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  Monthly savings goal ({activeCurrency})
                </label>
                <input
                  id="savings-goal"
                  type="number"
                  step={isZeroDecimal ? '1' : '0.01'}
                  min="0"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  placeholder={isZeroDecimal ? '0' : '0.00'}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface border border-line rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  02. Expense Category Budgets
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Add expense categories and set spending limits for this month.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewBudgetModal}
                disabled={unaddedExpenseCategories.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-text bg-accent-soft hover:bg-accent-soft-hover rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Category Budget</span>
              </button>
            </div>

            {addedBudgets.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-ink-muted">
                  No category budgets added yet. Click &ldquo;New Category Budget&rdquo; to allocate a category limit.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {addedBudgets.map((item) => {
                  const cat = categoryById.get(item.categoryId);
                  const catName = cat?.name || `Category #${item.categoryId}`;
                  const pillar = KAKEIBO_PILLAR_META[catName];
                  const description = cat?.description || pillar?.description || null;

                  return (
                    <div
                      key={item.categoryId}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`budget-${item.categoryId}`}
                            className="text-sm font-medium text-ink"
                          >
                            {catName}
                          </label>
                          {pillar && (
                            <span className="text-xs text-ink-muted">· {pillar.jp}</span>
                          )}
                        </div>
                        {description && (
                          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-full sm:w-44">
                          <input
                            id={`budget-${item.categoryId}`}
                            type="number"
                            step={isZeroDecimal ? '1' : '0.01'}
                            min="0"
                            value={item.allocatedAmount}
                            onChange={(e) =>
                              handleUpdateBudgetAmount(item.categoryId, e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm font-mono tabular-nums text-right bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBudget(item.categoryId)}
                          aria-label={`Remove ${catName} budget`}
                          className="p-2 rounded-lg text-ink-muted hover:text-danger-accent hover:bg-danger-bg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-surface border border-line rounded-xl p-6 space-y-4 sticky top-20">
            <h3 className="text-sm font-semibold text-ink">03. Plan Review</h3>

            <div className="space-y-3 text-sm border-t border-b border-line py-4">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Planned income</span>
                <span className="font-mono tabular-nums font-medium text-ink">
                  {formatCurrency(reviewMetrics.plannedIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Savings goal</span>
                <span className="font-mono tabular-nums font-medium text-success-accent">
                  -{formatCurrency(reviewMetrics.savingsGoal)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="font-medium text-ink">Available for spending</span>
                <span className="font-mono tabular-nums font-semibold text-ink">
                  {formatCurrency(reviewMetrics.plannedAvailable)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Allocated category budgets</span>
                <span className="font-mono tabular-nums font-medium text-ink">
                  {formatCurrency(reviewMetrics.totalAllocated)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="text-ink-muted">
                  {reviewMetrics.exceedsAvailable ? 'Over-allocated by' : 'Unallocated buffer'}
                </span>
                <span
                  className={`font-mono tabular-nums font-semibold ${
                    reviewMetrics.exceedsAvailable ? 'text-warning-accent' : 'text-success-accent'
                  }`}
                >
                  {formatCurrency(Math.abs(reviewMetrics.difference))}
                </span>
              </div>
            </div>

            {reviewMetrics.exceedsAvailable ? (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-lg bg-warning-bg border border-warning-line px-3.5 py-3 text-xs text-warning"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your allocated category budgets exceed your planned available spending (
                  {formatCurrency(reviewMetrics.plannedAvailable)}) by{' '}
                  <span className="font-mono font-semibold">
                    {formatCurrency(reviewMetrics.difference)}
                  </span>
                  . You can still save this plan, or adjust allocations.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-lg bg-success-bg border border-success-line px-3.5 py-3 text-xs text-success">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your category budgets fit within your planned spending capacity.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving plan...'
                  : currentPlan
                  ? 'Update monthly plan'
                  : 'Save monthly plan'}
              </span>
            </button>
          </section>
        </div>
      </form>

      <Modal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="New Category Budget"
        subtitle={`Allocate a spending limit for ${formatMonthYear(selectedMonth, selectedYear)}.`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCategoryBudget} className="space-y-4">
          {modalError && (
            <div className="rounded-lg bg-danger-bg border border-danger-line px-3.5 py-2.5 text-sm text-danger">
              {modalError}
            </div>
          )}

          <div>
            <label
              htmlFor="budget-modal-category"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Category
            </label>
            <select
              id="budget-modal-category"
              value={modalCategoryId}
              onChange={(e) => setModalCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            >
              <option value="">Select category</option>
              {unaddedExpenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="budget-modal-amount"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Allocated amount ({activeCurrency})
            </label>
            <input
              id="budget-modal-amount"
              type="number"
              step={isZeroDecimal ? '1' : '0.01'}
              min="0"
              value={modalAllocatedAmount}
              onChange={(e) => setModalAllocatedAmount(e.target.value)}
              placeholder={isZeroDecimal ? '0' : '0.00'}
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setBudgetModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg"
            >
              Add budget
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function MonthlyPlanPage() {
  const dispatch = useAppDispatch();

  const { selectedMonth, selectedYear, currentPlan, plans, loading, saving } = useAppSelector(
    (state) => state.plans
  );
  const categories = useAppSelector((state) => state.categories.items);

  const [futureModalOpen, setFutureModalOpen] = useState(false);
  const [futureMonth, setFutureMonth] = useState<number>(
    selectedMonth === 12 ? 1 : selectedMonth + 1
  );
  const [futureYear, setFutureYear] = useState<number>(
    selectedMonth === 12 ? selectedYear + 1 : selectedYear
  );

  useEffect(() => {
    dispatch(fetchCurrentPlan({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchPlans());
    dispatch(fetchCategories());
  }, [dispatch, selectedMonth, selectedYear]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories]
  );

  const handleSwitchToPeriod = (e: FormEvent) => {
    e.preventDefault();
    dispatch(setSelectedPeriod({ month: Number(futureMonth), year: Number(futureYear) }));
    setFutureModalOpen(false);
  };

  const isPeriodMismatch = Boolean(
    currentPlan && (currentPlan.month !== selectedMonth || currentPlan.year !== selectedYear)
  );
  const activePlan = isPeriodMismatch ? null : currentPlan;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            {formatMonthYear(selectedMonth, selectedYear)} Plan
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {activePlan && activePlan.updatedAt
              ? `Editing existing plan · Last updated ${new Date(activePlan.updatedAt).toLocaleDateString()}`
              : 'Step 1: Set expected income, savings goal, and category budgets'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFutureModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Plan another month</span>
        </button>
      </div>

      {loading || isPeriodMismatch ? (
        <CardSkeleton rows={5} />
      ) : (
        <PlanEditorForm
          key={`${selectedYear}-${selectedMonth}-${activePlan?.id || 'new'}-${activePlan?.updatedAt || ''}`}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          currentPlan={activePlan}
          expenseCategories={expenseCategories}
          saving={saving}
        />
      )}

      <section className="bg-surface border border-line rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink">All Monthly Plans</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Compare planned targets against actual results across months. Click any row to load it.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-xs text-ink-muted py-6 text-center">
            No monthly plans saved yet. Create your first plan above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-xs font-medium text-ink-muted">
                  <th className="py-2.5 pr-4">Period</th>
                  <th className="py-2.5 px-3 text-right">Planned Income</th>
                  <th className="py-2.5 px-3 text-right">Actual Income</th>
                  <th className="py-2.5 px-3 text-right">Allocated</th>
                  <th className="py-2.5 px-3 text-right">Expenses</th>
                  <th className="py-2.5 pl-3 text-right">Actual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {plans.map((p) => {
                  const isSelected = p.month === selectedMonth && p.year === selectedYear;
                  return (
                    <tr
                      key={p.id}
                      onClick={() =>
                        dispatch(setSelectedPeriod({ month: p.month, year: p.year }))
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-accent-soft/60' : 'hover:bg-surface-muted'
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium text-ink whitespace-nowrap">
                        {formatMonthYear(p.month, p.year)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-ink-secondary">
                        {formatCurrency(p.plannedIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-success-accent">
                        {formatCurrency(p.summary.actualIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-ink-secondary">
                        {formatCurrency(p.summary.totalAllocatedBudget)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-ink">
                        {formatCurrency(p.summary.totalExpenses)}
                      </td>
                      <td
                        className={`py-3 pl-3 text-right font-mono tabular-nums font-medium ${
                          p.summary.actualSavings >= 0 ? 'text-accent-text' : 'text-danger-accent'
                        }`}
                      >
                        {formatCurrency(p.summary.actualSavings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={futureModalOpen}
        onClose={() => setFutureModalOpen(false)}
        title="Plan another month"
        subtitle="Select a month and year to view or create its financial plan."
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSwitchToPeriod} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="target-month" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Month
              </label>
              <select
                id="target-month"
                value={futureMonth}
                onChange={(e) => setFutureMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-year" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Year
              </label>
              <input
                id="target-year"
                type="number"
                min="2000"
                max="2100"
                value={futureYear}
                onChange={(e) => setFutureYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setFutureModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg"
            >
              Open month
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
