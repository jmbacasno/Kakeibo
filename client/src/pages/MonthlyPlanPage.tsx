import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Plus,
  Save,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import { createCategory, fetchCategories } from '../features/categories/categorySlice';
import {
  createPlan,
  fetchCurrentPlan,
  fetchPlans,
  setSelectedPeriod,
  updatePlan,
} from '../features/plans/planSlice';
import { Category, MonthlyPlan, PlanStatus } from '../types/models';
import {
  formatCurrency,
  formatMonthYear,
  KAKEIBO_PILLAR_META,
  MONTH_NAMES,
} from '../utils/formatters';

interface PlanEditorFormProps {
  selectedMonth: number;
  selectedYear: number;
  currentPlan: MonthlyPlan | null;
  planExpenseCategories: Category[];
  saving: boolean;
  onOpenNewCategory: () => void;
}

function PlanEditorForm({
  selectedMonth,
  selectedYear,
  currentPlan,
  planExpenseCategories,
  saving,
  onOpenNewCategory,
}: PlanEditorFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const activeCurrency = useAppSelector((state) => state.settings.data?.currency || 'USD');
  const isZeroDecimal = activeCurrency === 'JPY';

  const initialBudgets = useMemo(() => {
    const map: Record<number, string> = {};
    for (const cat of planExpenseCategories) {
      const match = currentPlan?.budgets?.find((b) => b.categoryId === cat.id);
      map[cat.id] = match ? String(match.allocatedAmount) : '0';
    }
    return map;
  }, [currentPlan, planExpenseCategories]);

  const [plannedIncome, setPlannedIncome] = useState<string>(
    currentPlan ? String(currentPlan.plannedIncome ?? 0) : ''
  );
  const [savingsGoal, setSavingsGoal] = useState<string>(
    currentPlan ? String(currentPlan.savingsGoal ?? 0) : ''
  );
  const [status, setStatus] = useState<PlanStatus>(currentPlan?.status || 'ACTIVE');
  const [budgetInputs, setBudgetInputs] = useState<Record<number, string>>(initialBudgets);
  const [formError, setFormError] = useState('');

  const reviewMetrics = useMemo(() => {
    const toCents = (v: string | number) => Math.round((Number(v) || 0) * 100);
    const incomeCents = toCents(plannedIncome);
    const goalCents = toCents(savingsGoal);
    const availableCents = incomeCents - goalCents;

    let allocatedCents = 0;
    for (const cat of planExpenseCategories) {
      const raw = budgetInputs[cat.id] ?? '0';
      allocatedCents += Math.max(0, toCents(raw));
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
  }, [plannedIncome, savingsGoal, budgetInputs, planExpenseCategories]);

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
    for (const cat of planExpenseCategories) {
      const raw = budgetInputs[cat.id];
      const amt = Number(raw === '' || raw === undefined ? 0 : raw);
      if (!Number.isFinite(amt) || amt < 0) {
        setFormError(`Budget for "${cat.name}" cannot be negative.`);
        return;
      }
      budgetsPayload.push({ categoryId: cat.id, allocatedAmount: amt });
    }

    if (currentPlan) {
      const res = await dispatch(
        updatePlan({
          id: currentPlan.id,
          data: {
            plannedIncome: incVal,
            savingsGoal: goalVal,
            status,
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
          status,
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                01. Income &amp; Savings Intention
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Define how much you expect to receive and how much you aim to keep.
              </p>
            </div>

            <div>
              <label htmlFor="plan-status" className="sr-only">
                Plan status
              </label>
              <select
                id="plan-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PlanStatus)}
                className="px-3 py-1.5 text-xs font-medium bg-canvas border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
              >
                <option value="DRAFT">Status: Draft</option>
                <option value="ACTIVE">Status: Active</option>
                <option value="COMPLETED">Status: Completed</option>
              </select>
            </div>
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
                Allocate spending limits across your Kakeibo pillars and custom categories.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNewCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-text bg-accent-soft hover:bg-accent-soft-hover rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New expense category</span>
            </button>
          </div>

          <div className="divide-y divide-line">
            {planExpenseCategories.map((cat) => {
              const pillar = KAKEIBO_PILLAR_META[cat.name];
              return (
                <div
                  key={cat.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`budget-${cat.id}`}
                        className="text-sm font-medium text-ink"
                      >
                        {cat.name}
                      </label>
                      {pillar && (
                        <span className="text-xs text-ink-muted">· {pillar.jp}</span>
                      )}
                      {!cat.isActive && (
                        <span className="text-xs text-ink-muted">· Archived</span>
                      )}
                    </div>
                    {pillar && (
                      <p className="text-xs text-ink-muted mt-0.5">{pillar.description}</p>
                    )}
                  </div>

                  <div className="w-full sm:w-44 shrink-0">
                    <input
                      id={`budget-${cat.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetInputs[cat.id] ?? '0'}
                      onChange={(e) =>
                        setBudgetInputs((prev) => ({
                          ...prev,
                          [cat.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums text-right bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
  );
}

export default function MonthlyPlanPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, plans, loading, saving } = useAppSelector(
    (state) => state.plans
  );
  const categories = useAppSelector((state) => state.categories.items);

  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatError, setNewCatError] = useState('');

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

  const activeExpenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE' && c.isActive),
    [categories]
  );

  const planExpenseCategories = useMemo(() => {
    const existingBudgetMap = new Map<number, Category | null>(
      (currentPlan?.budgets || []).map((b) => [b.categoryId, b.category])
    );
    const merged = [...activeExpenseCategories];
    for (const [catId, cat] of existingBudgetMap.entries()) {
      if (cat && !merged.some((c) => c.id === catId)) {
        merged.push(cat);
      }
    }
    return merged;
  }, [activeExpenseCategories, currentPlan]);

  const handleCreateCustomCategory = async (e: FormEvent) => {
    e.preventDefault();
    setNewCatError('');
    if (!newCatName.trim()) {
      setNewCatError('Category name is required.');
      return;
    }

    const res = await dispatch(createCategory({ name: newCatName.trim(), type: 'EXPENSE' }));
    if (createCategory.fulfilled.match(res)) {
      setNewCatName('');
      setNewCatModalOpen(false);
      toast.success(`Expense category "${res.payload.name}" created.`);
    } else {
      setNewCatError(res.payload || 'Unable to create category.');
    }
  };

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
          planExpenseCategories={planExpenseCategories}
          saving={saving}
          onOpenNewCategory={() => setNewCatModalOpen(true)}
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
                  <th className="py-2.5 px-3">Status</th>
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
                      <td className="py-3 px-3 text-xs text-ink-muted capitalize whitespace-nowrap">
                        {p.status.toLowerCase()}
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
        open={newCatModalOpen}
        onClose={() => setNewCatModalOpen(false)}
        title="New expense category"
        subtitle="Create a custom expense category and allocate a budget to it."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomCategory} className="space-y-4">
          {newCatError && (
            <div className="rounded-lg bg-danger-bg border border-danger-line px-3.5 py-2.5 text-sm text-danger">
              {newCatError}
            </div>
          )}
          <div>
            <label htmlFor="new-expense-cat" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Category name
            </label>
            <input
              id="new-expense-cat"
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Dining Out, Utilities, Subscriptions"
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setNewCatModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg"
            >
              Create category
            </button>
          </div>
        </form>
      </Modal>

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
