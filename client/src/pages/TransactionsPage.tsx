import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import { useToast } from '../components/ToastProvider';
import { fetchCategories } from '../features/categories/categorySlice';
import { fetchCurrentPlan } from '../features/plans/planSlice';
import TransactionModal from '../features/transactions/components/TransactionModal';
import {
  deleteTransaction,
  fetchTransactions,
  resetTransactionFilters,
  setTransactionFilters,
} from '../features/transactions/transactionSlice';
import { CategoryType, Transaction } from '../types/models';
import { formatCurrency, formatDateDisplay, formatMonthYear } from '../utils/formatters';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, loading: planLoading } = useAppSelector(
    (state) => state.plans
  );
  const { items: transactions, pagination, filters, loading } = useAppSelector(
    (state) => state.transactions
  );
  const categories = useAppSelector((state) => state.categories.items);

  const [scope, setScope] = useState<'month' | 'all'>('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentPlan({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchCategories());
  }, [dispatch, selectedMonth, selectedYear]);

  const loadTransactions = useCallback(() => {
    if (scope === 'month' && !currentPlan) {
      return;
    }
    dispatch(
      fetchTransactions({
        ...filters,
        planId: scope === 'month' && currentPlan ? currentPlan.id : undefined,
      })
    );
  }, [dispatch, filters, scope, currentPlan]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredCategories = useMemo(() => {
    if (!filters.type) return categories;
    return categories.filter((c) => c.type === filters.type);
  }, [categories, filters.type]);

  const groupedByDate = useMemo(() => {
    if (filters.sortBy !== 'date') return null;
    const groups: Array<{ date: string; items: Transaction[] }> = [];
    const map = new Map<string, { date: string; items: Transaction[] }>();
    for (const tx of transactions) {
      const key = tx.transactionDate;
      let entry = map.get(key);
      if (!entry) {
        entry = { date: key, items: [] };
        map.set(key, entry);
        groups.push(entry);
      }
      entry.items.push(tx);
    }
    return groups;
  }, [transactions, filters.sortBy]);

  const handleOpenCreate = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx) return;
    setDeletingLoading(true);
    const res = await dispatch(deleteTransaction(deletingTx.id));
    setDeletingLoading(false);
    if (deleteTransaction.fulfilled.match(res)) {
      toast.success('Transaction deleted.');
      setDeletingTx(null);
      loadTransactions();
    } else {
      toast.error(res.payload || 'Unable to delete transaction.');
    }
  };

  const handleResetFilters = () => {
    dispatch(resetTransactionFilters());
  };

  const hasActiveFilters = Boolean(
    filters.type ||
      filters.categoryId ||
      filters.startDate ||
      filters.endDate ||
      filters.search
  );

  const showNoPlanForMonth = scope === 'month' && !planLoading && !currentPlan;

  const renderTransactionRow = (tx: Transaction) => {
    const isIncome = tx.type === 'INCOME';
    return (
      <div
        key={tx.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 hover:bg-surface-muted transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
              isIncome ? 'bg-success-bg text-success-accent' : 'bg-subtle text-ink-secondary'
            }`}
          >
            {isIncome ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{tx.description}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {tx.category?.name || 'Uncategorized'} · {isIncome ? 'Income' : 'Expense'} ·{' '}
              <span className="font-mono tabular-nums">{formatDateDisplay(tx.transactionDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span
            className={`text-sm font-mono tabular-nums font-semibold ${
              isIncome ? 'text-success-accent' : 'text-ink'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleOpenEdit(tx)}
              aria-label={`Edit ${tx.description}`}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTx(tx)}
              aria-label={`Delete ${tx.description}`}
              className="p-1.5 rounded-lg text-ink-muted hover:text-danger-accent hover:bg-danger-bg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            {scope === 'month'
              ? `${formatMonthYear(selectedMonth, selectedYear)} Ledger`
              : 'All Transactions'}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Track daily income and expenses against your monthly plan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-subtle-strong rounded-lg">
            <button
              type="button"
              onClick={() => {
                setScope('month');
                dispatch(setTransactionFilters({ page: 1 }));
              }}
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
              onClick={() => {
                setScope('all');
                dispatch(setTransactionFilters({ page: 1 }));
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scope === 'all'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All months
            </button>
          </div>

          {currentPlan && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <section className="bg-surface border border-line rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <label htmlFor="tx-search" className="sr-only">
              Search descriptions
            </label>
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="tx-search"
              type="text"
              value={filters.search}
              onChange={(e) =>
                dispatch(setTransactionFilters({ search: e.target.value, page: 1 }))
              }
              placeholder="Search description..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text"
            />
          </div>

          <div>
            <label htmlFor="tx-filter-type" className="sr-only">
              Filter by type
            </label>
            <select
              id="tx-filter-type"
              value={filters.type}
              onChange={(e) =>
                dispatch(
                  setTransactionFilters({
                    type: e.target.value as '' | CategoryType,
                    categoryId: '',
                    page: 1,
                  })
                )
              }
              className="w-full px-3 py-2 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
            >
              <option value="">All types</option>
              <option value="EXPENSE">Expenses only</option>
              <option value="INCOME">Income only</option>
            </select>
          </div>

          <div>
            <label htmlFor="tx-filter-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="tx-filter-category"
              value={filters.categoryId}
              onChange={(e) =>
                dispatch(setTransactionFilters({ categoryId: e.target.value, page: 1 }))
              }
              className="w-full px-3 py-2 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
            >
              <option value="">All categories</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                  {!cat.isActive ? ' (Archived)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-sort" className="sr-only">
              Sort order
            </label>
            <select
              id="tx-sort"
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':') as [
                  'date' | 'amount',
                  'asc' | 'desc',
                ];
                dispatch(setTransactionFilters({ sortBy, sortOrder, page: 1 }));
              }}
              className="w-full px-3 py-2 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
            >
              <option value="date:desc">Newest first</option>
              <option value="date:asc">Oldest first</option>
              <option value="amount:desc">Highest amount</option>
              <option value="amount:asc">Lowest amount</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-ink-secondary bg-canvas border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line text-xs">
          <span className="text-ink-muted font-medium">Date range:</span>
          <div className="flex items-center gap-2">
            <label htmlFor="tx-start-date" className="sr-only">
              Start date
            </label>
            <input
              id="tx-start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                dispatch(setTransactionFilters({ startDate: e.target.value, page: 1 }))
              }
              className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
            />
            <span className="text-ink-muted">to</span>
            <label htmlFor="tx-end-date" className="sr-only">
              End date
            </label>
            <input
              id="tx-end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                dispatch(setTransactionFilters({ endDate: e.target.value, page: 1 }))
              }
              className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text"
            />
          </div>
        </div>
      </section>

      {showNoPlanForMonth ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Create a monthly plan for this period before recording transactions, or switch to All months above to inspect historical entries."
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
        <CardSkeleton rows={5} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'Record your first income or expense entry to start tracking this month.'
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle"
              >
                Reset filters
              </button>
            ) : currentPlan ? (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Record first transaction</span>
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {groupedByDate ? (
            groupedByDate.map((group) => (
              <div
                key={group.date}
                className="bg-surface border border-line rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-surface-muted border-b border-line flex items-center justify-between">
                  <span className="text-xs font-mono tabular-nums font-medium text-ink-secondary">
                    {formatDateDisplay(group.date)}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {group.items.map(renderTransactionRow)}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
              {transactions.map(renderTransactionRow)}
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={(nextPage) =>
              dispatch(setTransactionFilters({ page: nextPage }))
            }
          />
        </div>
      )}

      {(currentPlan || editingTx?.monthlyPlan) && (
        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={
            editingTx?.monthlyPlan
              ? {
                  id: editingTx.monthlyPlanId,
                  month: editingTx.monthlyPlan.month,
                  year: editingTx.monthlyPlan.year,
                }
              : currentPlan
          }
          transaction={editingTx}
          onSuccess={loadTransactions}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleConfirmDelete}
        title="Delete transaction"
        message={
          deletingTx
            ? `Are you sure you want to delete "${deletingTx.description}" (${formatCurrency(
                deletingTx.amount
              )})? This will immediately recalculate your monthly totals.`
            : ''
        }
        loading={deletingLoading}
      />
    </div>
  );
}
