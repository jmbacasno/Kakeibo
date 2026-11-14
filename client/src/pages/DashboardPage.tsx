import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import EmptyState from '../components/EmptyState';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { fetchCategories } from '../features/categories/categorySlice';
import {
  BudgetAllocationChart,
  IncomeVsExpenseChart,
  PlannedVsActualChart,
  SavingsProgressCard,
} from '../features/dashboard/components/DashboardCharts';
import { fetchDashboard } from '../features/dashboard/dashboardSlice';
import { setSelectedPeriod } from '../features/plans/planSlice';
import TransactionModal from '../features/transactions/components/TransactionModal';
import { formatCurrency, formatDateDisplay, formatMonthYear } from '../utils/formatters';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { selectedMonth, selectedYear } = useAppSelector((state) => state.plans);
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  const [txModalOpen, setTxModalOpen] = useState(false);

  const refreshDashboard = () => {
    dispatch(fetchDashboard({ month: selectedMonth, year: selectedYear }));
  };

  useEffect(() => {
    dispatch(fetchDashboard({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchCategories());
  }, [dispatch, selectedMonth, selectedYear]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-danger-bg border border-danger-line p-6 text-sm text-danger">
        <p className="font-medium">Unable to load dashboard</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const plan = data?.plan || null;
  const summary = data?.summary || null;
  const hasPlan = Boolean(data?.hasPlan && plan && summary);
  const recentTransactions = data?.recentTransactions || [];
  const availableMonths = data?.availableMonths || [];

  return (
    <div className="space-y-6">
      {/* Contextual Top Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            {formatMonthYear(selectedMonth, selectedYear)}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {hasPlan && plan
              ? `Monthly ledger · Plan status: ${plan.status.toLowerCase()}`
              : 'No monthly plan created for this period yet'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {availableMonths.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <label htmlFor="quick-history" className="text-xs text-ink-muted">
                Saved plans:
              </label>
              <select
                id="quick-history"
                value={
                  availableMonths.some(
                    (p) => p.month === selectedMonth && p.year === selectedYear
                  )
                    ? `${selectedYear}-${selectedMonth}`
                    : ''
                }
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m] = e.target.value.split('-').map(Number);
                  dispatch(setSelectedPeriod({ month: m, year: y }));
                }}
                className="px-2.5 py-1.5 text-xs bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
              >
                <option value="">Jump to month...</option>
                {availableMonths.map((p) => (
                  <option key={p.id} value={`${p.year}-${p.month}`}>
                    {formatMonthYear(p.month, p.year)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasPlan ? (
            <button
              type="button"
              onClick={() => setTxModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Record transaction</span>
            </button>
          ) : (
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <CalendarRange className="w-4 h-4" />
              <span>Create monthly plan</span>
            </Link>
          )}
        </div>
      </div>

      {!hasPlan || !plan || !summary ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Begin this month by setting your expected income, savings goal, and category budgets. Once your plan is ready, you can record daily income and expenses."
          action={
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>Create {formatMonthYear(selectedMonth, selectedYear)} plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <>
          {/* Financial Overview Metric Grid */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-line">
              <div className="p-4">
                <p className="text-xs text-ink-muted">Planned income</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-ink">
                  {formatCurrency(summary.plannedIncome)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-ink-muted">Actual income</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-success-accent">
                  {formatCurrency(summary.actualIncome)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-ink-muted">Savings goal</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-ink">
                  {formatCurrency(summary.savingsGoal)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-ink-muted">Actual savings</p>
                <p
                  className={`mt-1.5 text-base font-mono tabular-nums font-semibold ${
                    summary.actualSavings >= 0 ? 'text-accent-text' : 'text-danger-accent'
                  }`}
                >
                  {formatCurrency(summary.actualSavings)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-ink-muted">Allocated budget</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-ink">
                  {formatCurrency(summary.totalAllocatedBudget)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-ink-muted">Total expenses</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-ink">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>

              <div className="p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-ink-muted">Remaining budget</p>
                <p
                  className={`mt-1.5 text-base font-mono tabular-nums font-semibold ${
                    summary.remainingBudget < 0 ? 'text-danger-accent' : 'text-success-accent'
                  }`}
                >
                  {formatCurrency(summary.remainingBudget)}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeVsExpenseChart
              plannedIncome={summary.plannedIncome}
              actualIncome={summary.actualIncome}
              totalExpenses={summary.totalExpenses}
            />
            <BudgetAllocationChart
              categoryBreakdown={summary.categoryBreakdown}
              totalAllocatedBudget={summary.totalAllocatedBudget}
            />
            <PlannedVsActualChart categoryBreakdown={summary.categoryBreakdown} />
            <SavingsProgressCard
              savingsGoal={summary.savingsGoal}
              actualSavings={summary.actualSavings}
              savingsProgressPercent={summary.savingsProgressPercent}
            />
          </div>

          {/* Category Budget Overview & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-surface border border-line rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Category Budget Overview</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Allocated limits, actual spending, and remaining room
                  </p>
                </div>
                <Link
                  to="/plan"
                  className="text-xs font-medium text-accent-text hover:underline whitespace-nowrap"
                >
                  Adjust budgets
                </Link>
              </div>

              {summary.categoryBreakdown.length === 0 ? (
                <p className="text-xs text-ink-muted py-6 text-center">
                  No category budgets set for this month. Visit Monthly Plan to allocate budgets.
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {summary.categoryBreakdown.map((item) => {
                    const barPct = item.hasZeroAllocation
                      ? item.actualSpent > 0
                        ? 100
                        : 0
                      : Math.min(100, item.utilizationPercent);

                    return (
                      <div key={item.categoryId} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-ink truncate">
                              {item.categoryName}
                            </span>
                            {!item.isActive && (
                              <span className="text-xs text-ink-muted">· Archived</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs shrink-0">
                            {item.isOverBudget ? (
                              <span className="inline-flex items-center gap-1 text-danger-accent font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Over budget
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-success-accent font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                On track
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="h-2 w-full bg-subtle rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-300"
                            style={{
                              width: `${barPct}%`,
                              backgroundColor: item.isOverBudget
                                ? 'var(--danger-accent)'
                                : item.utilizationPercent >= 85
                                ? 'var(--warning-accent)'
                                : 'var(--accent-primary)',
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-ink-muted">
                          <span>
                            Spent {formatCurrency(item.actualSpent)} of{' '}
                            {formatCurrency(item.allocatedAmount)}
                          </span>
                          <span
                            className={
                              item.remainingBudget < 0
                                ? 'text-danger-accent font-medium'
                                : 'text-ink-secondary'
                            }
                          >
                            {item.remainingBudget < 0
                              ? `${formatCurrency(Math.abs(item.remainingBudget))} over`
                              : `${formatCurrency(item.remainingBudget)} left`}
                            {!item.hasZeroAllocation && ` · ${item.utilizationPercent.toFixed(0)}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Transactions */}
            <section className="lg:col-span-5 bg-surface border border-line rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Recent Transactions</h2>
                  <p className="text-xs text-ink-muted mt-0.5">Latest entries for this month</p>
                </div>
                <Link
                  to="/transactions"
                  className="text-xs font-medium text-accent-text hover:underline whitespace-nowrap"
                >
                  View all
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-ink-muted">
                    No transactions recorded yet for {formatMonthYear(selectedMonth, selectedYear)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTxModalOpen(true)}
                    className="mt-3 text-xs font-medium text-accent-text hover:underline"
                  >
                    Record your first entry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {recentTransactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <div
                        key={tx.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`mt-0.5 p-1 rounded-md shrink-0 ${
                              isIncome
                                ? 'bg-success-bg text-success-accent'
                                : 'bg-subtle text-ink-secondary'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {tx.description}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5 truncate">
                              {formatDateDisplay(tx.transactionDate)} · {tx.category?.name} ·{' '}
                              {isIncome ? 'Income' : 'Expense'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-sm font-mono tabular-nums font-medium shrink-0 ${
                            isIncome ? 'text-success-accent' : 'text-ink'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {hasPlan && plan && (
        <TransactionModal
          open={txModalOpen}
          onClose={() => setTxModalOpen(false)}
          plan={plan}
          onSuccess={refreshDashboard}
        />
      )}
    </div>
  );
}
