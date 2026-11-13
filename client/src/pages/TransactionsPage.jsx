import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarRange,
  RotateCcw,
} from 'lucide-react';
import {
  deleteTransaction,
  fetchTransactions,
  resetTransactionFilters,
  setTransactionFilters,
} from '../features/transactions/transactionSlice.js';
import { fetchCurrentPlan } from '../features/plans/planSlice.js';
import { fetchCategories } from '../features/categories/categorySlice.js';
import TransactionModal from '../features/transactions/TransactionModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import { CardSkeleton } from '../components/LoadingSkeleton.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { formatCurrency, formatDateDisplay, formatMonthYear } from '../utils/formatters.js';

export default function TransactionsPage() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, loading: planLoading } = useSelector(
    (state) => state.plans
  );
  const { items: transactions, pagination, filters, loading } = useSelector(
    (state) => state.transactions
  );
  const categories = useSelector((state) => state.categories.items);

  const [scope, setScope] = useState('month'); // 'month' | 'all'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
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

  // Group transactions by date when sorted by date
  const groupedByDate = useMemo(() => {
    if (filters.sortBy !== 'date') return null;
    const groups = [];
    const map = new Map();
    for (const tx of transactions) {
      const key = tx.transactionDate;
      if (!map.has(key)) {
        const entry = { date: key, items: [] };
        map.set(key, entry);
        groups.push(entry);
      }
      map.get(key).items.push(tx);
    }
    return groups;
  }, [transactions, filters.sortBy]);

  const handleOpenCreate = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
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

  const hasActiveFilters =
    filters.type ||
    filters.categoryId ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  const showNoPlanForMonth = scope === 'month' && !planLoading && !currentPlan;

  const renderTransactionRow = (tx) => {
    const isIncome = tx.type === 'INCOME';
    return (
      <div
        key={tx.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 hover:bg-[#FAF9F6] transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
              isIncome
                ? 'bg-[#F4FAF6] text-[#2A6F4E]'
                : 'bg-[#F4F2ED] text-[#4A4740]'
            }`}
          >
            {isIncome ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1C1B18] truncate">{tx.description}</p>
            <p className="text-xs text-[#6B675E] mt-0.5">
              {tx.category?.name || 'Uncategorized'} · {isIncome ? 'Income' : 'Expense'} ·{' '}
              <span className="font-mono tabular-nums">{formatDateDisplay(tx.transactionDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span
            className={`text-sm font-mono tabular-nums font-semibold ${
              isIncome ? 'text-[#2A6F4E]' : 'text-[#1C1B18]'
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
              className="p-1.5 rounded-lg text-[#6B675E] hover:text-[#1C1B18] hover:bg-[#EFECE6] transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTx(tx)}
              aria-label={`Delete ${tx.description}`}
              className="p-1.5 rounded-lg text-[#6B675E] hover:text-[#B83B3B] hover:bg-[#FDF6F6] transition-colors"
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
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B18]">
            {scope === 'month'
              ? `${formatMonthYear(selectedMonth, selectedYear)} Ledger`
              : 'All Transactions'}
          </h2>
          <p className="text-xs text-[#6B675E] mt-1">
            Track daily income and expenses against your monthly plan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-[#EAE7E0] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setScope('month');
                dispatch(setTransactionFilters({ page: 1 }));
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scope === 'month'
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#6B675E] hover:text-[#1C1B18]'
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
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#6B675E] hover:text-[#1C1B18]'
              }`}
            >
              All months
            </button>
          </div>

          {currentPlan && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <section className="bg-white border border-[#E5E2DC] rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <label htmlFor="tx-search" className="sr-only">
              Search descriptions
            </label>
            <Search className="w-4 h-4 text-[#6B675E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="tx-search"
              type="text"
              value={filters.search}
              onChange={(e) =>
                dispatch(setTransactionFilters({ search: e.target.value, page: 1 }))
              }
              placeholder="Search description..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] placeholder:text-[#9E998E] focus:outline-none focus:border-[#355482]"
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
                    type: e.target.value,
                    categoryId: '',
                    page: 1,
                  })
                )
              }
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482]"
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
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482]"
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
                const [sortBy, sortOrder] = e.target.value.split(':');
                dispatch(setTransactionFilters({ sortBy, sortOrder, page: 1 }));
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482]"
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
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A4740] bg-[#F8F7F4] border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5E2DC] text-xs">
          <span className="text-[#6B675E] font-medium">Date range:</span>
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
              className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg"
            />
            <span className="text-[#6B675E]">to</span>
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
              className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Transactions List */}
      {showNoPlanForMonth ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Create a monthly plan for this period before recording transactions, or switch to All months above to inspect historical entries."
          action={
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg"
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
                className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA]"
              >
                Reset filters
              </button>
            ) : currentPlan ? (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg"
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
                className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E5E2DC] flex items-center justify-between">
                  <span className="text-xs font-mono tabular-nums font-medium text-[#4A4740]">
                    {formatDateDisplay(group.date)}
                  </span>
                  <span className="text-xs text-[#6B675E]">
                    {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <div className="divide-y divide-[#E5E2DC]">
                  {group.items.map(renderTransactionRow)}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden divide-y divide-[#E5E2DC]">
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

      {/* Transaction Form Modal */}
      {currentPlan && (
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

      {/* Delete Confirmation */}
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
