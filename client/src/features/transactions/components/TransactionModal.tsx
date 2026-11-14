import { FormEvent, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/ToastProvider';
import { CategoryType, Transaction, TransactionPlanSummary } from '../../../types/models';
import {
  formatMonthYear,
  getDefaultDateForMonth,
  getMonthDateBounds,
} from '../../../utils/formatters';
import { createTransaction, updateTransaction } from '../transactionSlice';

interface TransactionFormProps {
  onClose: () => void;
  plan: TransactionPlanSummary;
  transaction: Transaction | null;
  defaultType: CategoryType;
  onSuccess?: () => void;
}

function TransactionForm({
  onClose,
  plan,
  transaction,
  defaultType,
  onSuccess,
}: TransactionFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const categories = useAppSelector((state) => state.categories.items);
  const { saving } = useAppSelector((state) => state.transactions);
  const activeCurrency = useAppSelector((state) => state.settings.data?.currency || 'USD');
  const isZeroDecimal = activeCurrency === 'JPY';

  const initialType: CategoryType = transaction
    ? transaction.type || transaction.category?.type || 'EXPENSE'
    : defaultType;
  const firstActiveForInitial = categories.find((c) => c.type === initialType && c.isActive);

  const [type, setType] = useState<CategoryType>(initialType);
  const [categoryId, setCategoryId] = useState<string>(
    transaction
      ? String(transaction.categoryId)
      : firstActiveForInitial
      ? String(firstActiveForInitial.id)
      : ''
  );
  const [amount, setAmount] = useState<string>(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState<string>(
    transaction ? transaction.description || '' : ''
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    transaction?.transactionDate || getDefaultDateForMonth(plan.month, plan.year)
  );
  const [error, setError] = useState<string>('');

  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (cat.type !== type) return false;
      if (cat.isActive) return true;
      return Boolean(transaction && cat.id === transaction.categoryId);
    });
  }, [categories, type, transaction]);

  const handleTypeChange = (nextType: CategoryType) => {
    setType(nextType);
    const matching = categories.filter((c) => c.type === nextType && c.isActive);
    setCategoryId(matching[0] ? String(matching[0].id) : '');
  };

  const bounds = getMonthDateBounds(plan.month, plan.year);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Number(amount);
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a short description.');
      return;
    }
    if (!transactionDate) {
      setError('Please select a transaction date.');
      return;
    }
    if (transactionDate < bounds.min || transactionDate > bounds.max) {
      setError(`Date must fall within ${formatMonthYear(plan.month, plan.year)}.`);
      return;
    }

    const payload = {
      monthlyPlanId: plan.id,
      categoryId: Number(categoryId),
      amount: parsedAmount,
      description: description.trim(),
      transactionDate,
    };

    if (transaction) {
      const res = await dispatch(updateTransaction({ id: transaction.id, data: payload }));
      if (updateTransaction.fulfilled.match(res)) {
        toast.success('Transaction updated.');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.payload || 'Unable to update transaction.');
      }
    } else {
      const res = await dispatch(createTransaction(payload));
      if (createTransaction.fulfilled.match(res)) {
        toast.success('Transaction recorded.');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.payload || 'Unable to record transaction.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg border border-danger-line px-3.5 py-2.5 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <div>
        <span className="block text-xs font-medium text-ink-secondary mb-1.5">
          Transaction type
        </span>
        <div className="grid grid-cols-2 gap-1 p-1 bg-subtle rounded-lg">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`py-2 text-sm font-medium rounded-md transition-colors ${
              type === 'EXPENSE'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`py-2 text-sm font-medium rounded-md transition-colors ${
              type === 'INCOME'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tx-category" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Category
          </label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Select category</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {!cat.isActive ? ' (Archived)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-amount" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Amount ({activeCurrency})
          </label>
          <input
            id="tx-amount"
            type="number"
            step={isZeroDecimal ? '1' : '0.01'}
            min={isZeroDecimal ? '1' : '0.01'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={isZeroDecimal ? '0' : '0.00'}
            className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tx-description" className="block text-xs font-medium text-ink-secondary mb-1.5">
          Description
        </label>
        <input
          id="tx-description"
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'EXPENSE' ? 'e.g., Weekly groceries at market' : 'e.g., Monthly salary deposit'
          }
          className="w-full px-3 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <div>
        <label htmlFor="tx-date" className="block text-xs font-medium text-ink-secondary mb-1.5">
          Transaction date
        </label>
        <input
          id="tx-date"
          type="date"
          min={bounds.min}
          max={bounds.max}
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? 'Saving...' : transaction ? 'Save changes' : 'Save transaction'}
        </button>
      </div>
    </form>
  );
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  plan: TransactionPlanSummary | null;
  transaction?: Transaction | null;
  defaultType?: CategoryType;
  onSuccess?: () => void;
}

export default function TransactionModal({
  open,
  onClose,
  plan,
  transaction = null,
  defaultType = 'EXPENSE',
  onSuccess,
}: TransactionModalProps) {
  if (!plan) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? 'Edit transaction' : 'Record transaction'}
      subtitle={`For ${formatMonthYear(plan.month, plan.year)}`}
    >
      {open && (
        <TransactionForm
          key={`${plan.id}-${transaction?.id || 'new'}-${defaultType}`}
          onClose={onClose}
          plan={plan}
          transaction={transaction}
          defaultType={defaultType}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
