import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  Plus,
  Save,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react';
import {
  createPlan,
  fetchCurrentPlan,
  fetchPlans,
  setSelectedPeriod,
  updatePlan,
} from '../features/plans/planSlice.js';
import { createCategory, fetchCategories } from '../features/categories/categorySlice.js';
import { useToast } from '../components/ToastProvider.jsx';
import { CardSkeleton } from '../components/LoadingSkeleton.jsx';
import Modal from '../components/Modal.jsx';
import {
  formatCurrency,
  formatMonthYear,
  KAKEIBO_PILLAR_META,
  MONTH_NAMES,
} from '../utils/formatters.js';

function PlanEditorForm({
  selectedMonth,
  selectedYear,
  currentPlan,
  planExpenseCategories,
  saving,
  onOpenNewCategory,
}) {
  const dispatch = useDispatch();
  const toast = useToast();

  const initialBudgets = useMemo(() => {
    const map = {};
    for (const cat of planExpenseCategories) {
      const match = currentPlan?.budgets?.find((b) => b.categoryId === cat.id);
      map[cat.id] = match ? String(match.allocatedAmount) : '0';
    }
    return map;
  }, [currentPlan, planExpenseCategories]);

  const [plannedIncome, setPlannedIncome] = useState(
    currentPlan ? String(currentPlan.plannedIncome ?? 0) : ''
  );
  const [savingsGoal, setSavingsGoal] = useState(
    currentPlan ? String(currentPlan.savingsGoal ?? 0) : ''
  );
  const [status, setStatus] = useState(currentPlan?.status || 'ACTIVE');
  const [budgetInputs, setBudgetInputs] = useState(initialBudgets);
  const [formError, setFormError] = useState('');

  // Live plan review arithmetic using integer cents to avoid float drift
  const reviewMetrics = useMemo(() => {
    const toCents = (v) => Math.round((Number(v) || 0) * 100);
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

  const handleSavePlan = async (e) => {
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

    const budgetsPayload = [];
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
      {/* Left Column: Income, Goal, & Budget Allocations */}
      <div className="lg:col-span-8 space-y-6">
        {formError && (
          <div
            role="alert"
            className="rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] px-4 py-3 text-sm text-[#8F2A2A]"
          >
            {formError}
          </div>
        )}

        {/* Step 1 & 2: Income & Savings Goal */}
        <section className="bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2DC] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1C1B18]">
                01. Income &amp; Savings Intention
              </h3>
              <p className="text-xs text-[#6B675E] mt-0.5">
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
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-[#F8F7F4] border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482]"
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
                className="block text-xs font-medium text-[#4A4740] mb-1.5"
              >
                Expected monthly income (USD)
              </label>
              <input
                id="planned-income"
                type="number"
                step="0.01"
                min="0"
                value={plannedIncome}
                onChange={(e) => setPlannedIncome(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
              />
            </div>

            <div>
              <label
                htmlFor="savings-goal"
                className="block text-xs font-medium text-[#4A4740] mb-1.5"
              >
                Monthly savings goal (USD)
              </label>
              <input
                id="savings-goal"
                type="number"
                step="0.01"
                min="0"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
              />
            </div>
          </div>
        </section>

        {/* Step 3: Expense Category Budget Allocations */}
        <section className="bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2DC] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1C1B18]">
                02. Expense Category Budgets
              </h3>
              <p className="text-xs text-[#6B675E] mt-0.5">
                Allocate spending limits across your Kakeibo pillars and custom categories.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNewCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#355482] bg-[#EEF2F7] hover:bg-[#E1E8F2] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New expense category</span>
            </button>
          </div>

          <div className="divide-y divide-[#E5E2DC]">
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
                        className="text-sm font-medium text-[#1C1B18]"
                      >
                        {cat.name}
                      </label>
                      {pillar && (
                        <span className="text-xs text-[#6B675E]">· {pillar.jp}</span>
                      )}
                      {!cat.isActive && (
                        <span className="text-xs text-[#6B675E]">· Archived</span>
                      )}
                    </div>
                    {pillar && (
                      <p className="text-xs text-[#6B675E] mt-0.5">{pillar.description}</p>
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
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums text-right bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right Column: Plan Review Summary */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-4 sticky top-20">
          <h3 className="text-sm font-semibold text-[#1C1B18]">03. Plan Review</h3>

          <div className="space-y-3 text-sm border-t border-b border-[#E5E2DC] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[#6B675E]">Planned income</span>
              <span className="font-mono tabular-nums font-medium text-[#1C1B18]">
                {formatCurrency(reviewMetrics.plannedIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B675E]">Savings goal</span>
              <span className="font-mono tabular-nums font-medium text-[#2A6F4E]">
                -{formatCurrency(reviewMetrics.savingsGoal)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E2DC]">
              <span className="font-medium text-[#1C1B18]">Available for spending</span>
              <span className="font-mono tabular-nums font-semibold text-[#1C1B18]">
                {formatCurrency(reviewMetrics.plannedAvailable)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B675E]">Allocated category budgets</span>
              <span className="font-mono tabular-nums font-medium text-[#1C1B18]">
                {formatCurrency(reviewMetrics.totalAllocated)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E2DC]">
              <span className="text-[#6B675E]">
                {reviewMetrics.exceedsAvailable ? 'Over-allocated by' : 'Unallocated buffer'}
              </span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  reviewMetrics.exceedsAvailable ? 'text-[#B4690E]' : 'text-[#2A6F4E]'
                }`}
              >
                {formatCurrency(Math.abs(reviewMetrics.difference))}
              </span>
            </div>
          </div>

          {reviewMetrics.exceedsAvailable ? (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg bg-[#FEF9EE] border border-[#EAD4A3] px-3.5 py-3 text-xs text-[#8A510A]"
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
            <div className="flex items-start gap-2.5 rounded-lg bg-[#F4FAF6] border border-[#C2DFCE] px-3.5 py-3 text-xs text-[#1F543B]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your category budgets fit within your planned spending capacity.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
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
  const dispatch = useDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, plans, loading, saving } = useSelector(
    (state) => state.plans
  );
  const categories = useSelector((state) => state.categories.items);

  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatError, setNewCatError] = useState('');

  const [futureModalOpen, setFutureModalOpen] = useState(false);
  const [futureMonth, setFutureMonth] = useState(selectedMonth === 12 ? 1 : selectedMonth + 1);
  const [futureYear, setFutureYear] = useState(
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
    const existingBudgetMap = new Map(
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

  const handleCreateCustomCategory = async (e) => {
    e.preventDefault();
    setNewCatError('');
    if (!newCatName.trim()) {
      setNewCatError('Category name is required.');
      return;
    }

    const res = await dispatch(
      createCategory({ name: newCatName.trim(), type: 'EXPENSE' })
    );
    if (createCategory.fulfilled.match(res)) {
      setNewCatName('');
      setNewCatModalOpen(false);
      toast.success(`Expense category "${res.payload.name}" created.`);
    } else {
      setNewCatError(res.payload || 'Unable to create category.');
    }
  };

  const handleSwitchToPeriod = (e) => {
    e.preventDefault();
    dispatch(setSelectedPeriod({ month: Number(futureMonth), year: Number(futureYear) }));
    setFutureModalOpen(false);
  };

  const isPeriodMismatch =
    currentPlan &&
    (currentPlan.month !== selectedMonth || currentPlan.year !== selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B18]">
            {formatMonthYear(selectedMonth, selectedYear)} Plan
          </h2>
          <p className="text-xs text-[#6B675E] mt-1">
            {currentPlan && !isPeriodMismatch
              ? `Editing existing plan · Last updated ${new Date(currentPlan.updatedAt).toLocaleDateString()}`
              : 'Step 1: Set expected income, savings goal, and category budgets'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFutureModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors whitespace-nowrap"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Plan another month</span>
        </button>
      </div>

      {loading || isPeriodMismatch ? (
        <CardSkeleton rows={5} />
      ) : (
        <PlanEditorForm
          key={`${selectedYear}-${selectedMonth}-${currentPlan?.id || 'new'}-${currentPlan?.updatedAt || ''}`}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          currentPlan={currentPlan}
          planExpenseCategories={planExpenseCategories}
          saving={saving}
          onOpenNewCategory={() => setNewCatModalOpen(true)}
        />
      )}

      {/* Historical & Planned Months Comparison Table */}
      <section className="bg-white border border-[#E5E2DC] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#1C1B18]">All Monthly Plans</h3>
          <p className="text-xs text-[#6B675E] mt-0.5">
            Compare planned targets against actual results across months. Click any row to load it.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-xs text-[#6B675E] py-6 text-center">
            No monthly plans saved yet. Create your first plan above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DC] text-xs font-medium text-[#6B675E]">
                  <th className="py-2.5 pr-4">Period</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Planned Income</th>
                  <th className="py-2.5 px-3 text-right">Actual Income</th>
                  <th className="py-2.5 px-3 text-right">Allocated</th>
                  <th className="py-2.5 px-3 text-right">Expenses</th>
                  <th className="py-2.5 pl-3 text-right">Actual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] text-sm">
                {plans.map((p) => {
                  const isSelected = p.month === selectedMonth && p.year === selectedYear;
                  return (
                    <tr
                      key={p.id}
                      onClick={() =>
                        dispatch(setSelectedPeriod({ month: p.month, year: p.year }))
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EEF2F7]/60' : 'hover:bg-[#F8F7F4]'
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium text-[#1C1B18] whitespace-nowrap">
                        {formatMonthYear(p.month, p.year)}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#6B675E] capitalize whitespace-nowrap">
                        {p.status.toLowerCase()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#4A4740]">
                        {formatCurrency(p.plannedIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#2A6F4E]">
                        {formatCurrency(p.summary.actualIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#4A4740]">
                        {formatCurrency(p.summary.totalAllocatedBudget)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#1C1B18]">
                        {formatCurrency(p.summary.totalExpenses)}
                      </td>
                      <td
                        className={`py-3 pl-3 text-right font-mono tabular-nums font-medium ${
                          p.summary.actualSavings >= 0 ? 'text-[#355482]' : 'text-[#B83B3B]'
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

      {/* Inline Add Custom Expense Category Modal */}
      <Modal
        open={newCatModalOpen}
        onClose={() => setNewCatModalOpen(false)}
        title="New expense category"
        subtitle="Create a custom expense category and allocate a budget to it."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomCategory} className="space-y-4">
          {newCatError && (
            <div className="rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] px-3.5 py-2.5 text-sm text-[#8F2A2A]">
              {newCatError}
            </div>
          )}
          <div>
            <label htmlFor="new-expense-cat" className="block text-xs font-medium text-[#4A4740] mb-1.5">
              Category name
            </label>
            <input
              id="new-expense-cat"
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Dining Out, Utilities, Subscriptions"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => setNewCatModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#355482] hover:bg-[#29436A] rounded-lg"
            >
              Create category
            </button>
          </div>
        </form>
      </Modal>

      {/* Jump/Create Plan for Another Month Modal */}
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
              <label htmlFor="target-month" className="block text-xs font-medium text-[#4A4740] mb-1.5">
                Month
              </label>
              <select
                id="target-month"
                value={futureMonth}
                onChange={(e) => setFutureMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D4CC] rounded-lg"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-year" className="block text-xs font-medium text-[#4A4740] mb-1.5">
                Year
              </label>
              <input
                id="target-year"
                type="number"
                min="2000"
                max="2100"
                value={futureYear}
                onChange={(e) => setFutureYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => setFutureModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#355482] hover:bg-[#29436A] rounded-lg"
            >
              Open month
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
