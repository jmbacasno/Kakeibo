import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus,
  CalendarRange,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { fetchDashboard } from '../features/dashboard/dashboardSlice.js';
import { fetchCategories } from '../features/categories/categorySlice.js';
import { setSelectedPeriod } from '../features/plans/planSlice.js';
import {
  BudgetAllocationChart,
  IncomeVsExpenseChart,
  PlannedVsActualChart,
  SavingsProgressCard,
} from '../features/dashboard/DashboardCharts.jsx';
import TransactionModal from '../features/transactions/TransactionModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { DashboardSkeleton } from '../components/LoadingSkeleton.jsx';
import { formatCurrency, formatDateDisplay, formatMonthYear } from '../utils/formatters.js';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { selectedMonth, selectedYear } = useSelector((state) => state.plans);
  const { data, loading, error } = useSelector((state) => state.dashboard);

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
      <div className="rounded-xl bg-[#FDF6F6] border border-[#E8C5C5] p-6 text-sm text-[#8F2A2A]">
        <p className="font-medium">Unable to load dashboard</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const hasPlan = Boolean(data?.hasPlan && data?.plan);
  const summary = data?.summary;
  const recentTransactions = data?.recentTransactions || [];
  const availableMonths = data?.availableMonths || [];

  return (
    <div className="space-y-6">
      {/* Contextual Top Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B18]">
            {formatMonthYear(selectedMonth, selectedYear)}
          </h2>
          <p className="text-xs text-[#6B675E] mt-1">
            {hasPlan
              ? `Monthly ledger · Plan status: ${data.plan.status.toLowerCase()}`
              : 'No monthly plan created for this period yet'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {availableMonths.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <label htmlFor="quick-history" className="text-xs text-[#6B675E]">
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
                className="px-2.5 py-1.5 text-xs bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482]"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Record transaction</span>
            </button>
          ) : (
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <CalendarRange className="w-4 h-4" />
              <span>Create monthly plan</span>
            </Link>
          )}
        </div>
      </div>

      {!hasPlan ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Begin this month by setting your expected income, savings goal, and category budgets. Once your plan is ready, you can record daily income and expenses."
          action={
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>Create {formatMonthYear(selectedMonth, selectedYear)} plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <>
          {/* Financial Overview Metric Grid */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E2DC]">
              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Planned income</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-[#1C1B18]">
                  {formatCurrency(summary.plannedIncome)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Actual income</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-[#2A6F4E]">
                  {formatCurrency(summary.actualIncome)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Savings goal</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-[#1C1B18]">
                  {formatCurrency(summary.savingsGoal)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Actual savings</p>
                <p
                  className={`mt-1.5 text-base font-mono tabular-nums font-semibold ${
                    summary.actualSavings >= 0 ? 'text-[#355482]' : 'text-[#B83B3B]'
                  }`}
                >
                  {formatCurrency(summary.actualSavings)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Allocated budget</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-[#1C1B18]">
                  {formatCurrency(summary.totalAllocatedBudget)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-xs text-[#6B675E]">Total expenses</p>
                <p className="mt-1.5 text-base font-mono tabular-nums font-semibold text-[#1C1B18]">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>

              <div className="p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-[#6B675E]">Remaining budget</p>
                <p
                  className={`mt-1.5 text-base font-mono tabular-nums font-semibold ${
                    summary.remainingBudget < 0 ? 'text-[#B83B3B]' : 'text-[#2A6F4E]'
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
            {/* Category Budget Overview */}
            <section className="lg:col-span-7 bg-white border border-[#E5E2DC] rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#1C1B18]">Category Budget Overview</h2>
                  <p className="text-xs text-[#6B675E] mt-0.5">
                    Allocated limits, actual spending, and remaining room
                  </p>
                </div>
                <Link
                  to="/plan"
                  className="text-xs font-medium text-[#355482] hover:underline whitespace-nowrap"
                >
                  Adjust budgets
                </Link>
              </div>

              {summary.categoryBreakdown.length === 0 ? (
                <p className="text-xs text-[#6B675E] py-6 text-center">
                  No category budgets set for this month. Visit Monthly Plan to allocate budgets.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E2DC]">
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
                            <span className="text-sm font-medium text-[#1C1B18] truncate">
                              {item.categoryName}
                            </span>
                            {!item.isActive && (
                              <span className="text-xs text-[#6B675E]">· Archived</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs shrink-0">
                            {item.isOverBudget ? (
                              <span className="inline-flex items-center gap-1 text-[#B83B3B] font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Over budget
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#2A6F4E] font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                On track
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="h-2 w-full bg-[#F1EFEA] rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-300"
                            style={{
                              width: `${barPct}%`,
                              backgroundColor: item.isOverBudget
                                ? '#B83B3B'
                                : item.utilizationPercent >= 85
                                ? '#B4690E'
                                : '#355482',
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-[#6B675E]">
                          <span>
                            Spent {formatCurrency(item.actualSpent)} of{' '}
                            {formatCurrency(item.allocatedAmount)}
                          </span>
                          <span
                            className={
                              item.remainingBudget < 0 ? 'text-[#B83B3B] font-medium' : 'text-[#4A4740]'
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
            <section className="lg:col-span-5 bg-white border border-[#E5E2DC] rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#1C1B18]">Recent Transactions</h2>
                  <p className="text-xs text-[#6B675E] mt-0.5">Latest entries for this month</p>
                </div>
                <Link
                  to="/transactions"
                  className="text-xs font-medium text-[#355482] hover:underline whitespace-nowrap"
                >
                  View all
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-[#6B675E]">
                    No transactions recorded yet for {formatMonthYear(selectedMonth, selectedYear)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTxModalOpen(true)}
                    className="mt-3 text-xs font-medium text-[#355482] hover:underline"
                  >
                    Record your first entry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E2DC]">
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
                                ? 'bg-[#F4FAF6] text-[#2A6F4E]'
                                : 'bg-[#F4F2ED] text-[#4A4740]'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1C1B18] truncate">
                              {tx.description}
                            </p>
                            <p className="text-xs text-[#6B675E] mt-0.5 truncate">
                              {formatDateDisplay(tx.transactionDate)} · {tx.category?.name} ·{' '}
                              {isIncome ? 'Income' : 'Expense'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-sm font-mono tabular-nums font-medium shrink-0 ${
                            isIncome ? 'text-[#2A6F4E]' : 'text-[#1C1B18]'
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

      {hasPlan && (
        <TransactionModal
          open={txModalOpen}
          onClose={() => setTxModalOpen(false)}
          plan={data.plan}
          onSuccess={refreshDashboard}
        />
      )}
    </div>
  );
}
