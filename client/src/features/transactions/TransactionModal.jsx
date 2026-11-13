import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { createTransaction, updateTransaction } from './transactionSlice.js';
import {
  formatMonthYear,
  getDefaultDateForMonth,
  getMonthDateBounds,
} from '../../utils/formatters.js';

function TransactionForm({ onClose, plan, transaction, defaultType, onSuccess }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const categories = useSelector((state) => state.categories.items);
  const { saving } = useSelector((state) => state.transactions);

  const initialType = transaction
    ? transaction.type || transaction.category?.type || 'EXPENSE'
    : defaultType;
  const firstActiveForInitial = categories.find((c) => c.type === initialType && c.isActive);

  const [type, setType] = useState(initialType);
  const [categoryId, setCategoryId] = useState(
    transaction
      ? String(transaction.categoryId)
      : firstActiveForInitial
      ? String(firstActiveForInitial.id)
      : ''
  );
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction ? transaction.description || '' : '');
  const [transactionDate, setTransactionDate] = useState(
    transaction?.transactionDate || getDefaultDateForMonth(plan.month, plan.year)
  );
  const [error, setError] = useState('');

  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (cat.type !== type) return false;
      if (cat.isActive) return true;
      return transaction && cat.id === transaction.categoryId;
    });
  }, [categories, type, transaction]);

  const handleTypeChange = (nextType) => {
    setType(nextType);
    const matching = categories.filter((c) => c.type === nextType && c.isActive);
    setCategoryId(matching[0] ? String(matching[0].id) : '');
  };

  const bounds = getMonthDateBounds(plan.month, plan.year);

  const handleSubmit = async (e) => {
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
          className="rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] px-3.5 py-2.5 text-sm text-[#8F2A2A]"
        >
          {error}
        </div>
      )}

      <div>
        <span className="block text-xs font-medium text-[#4A4740] mb-1.5">
          Transaction type
        </span>
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#F1EFEA] rounded-lg">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`py-2 text-sm font-medium rounded-md transition-colors ${
              type === 'EXPENSE'
                ? 'bg-white text-[#1C1B18] shadow-xs'
                : 'text-[#6B675E] hover:text-[#1C1B18]'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`py-2 text-sm font-medium rounded-md transition-colors ${
              type === 'INCOME'
                ? 'bg-white text-[#1C1B18] shadow-xs'
                : 'text-[#6B675E] hover:text-[#1C1B18]'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tx-category" className="block text-xs font-medium text-[#4A4740] mb-1.5">
            Category
          </label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
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
          <label htmlFor="tx-amount" className="block text-xs font-medium text-[#4A4740] mb-1.5">
            Amount (USD)
          </label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tx-description" className="block text-xs font-medium text-[#4A4740] mb-1.5">
          Description
        </label>
        <input
          id="tx-description"
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'EXPENSE' ? 'e.g., Weekly groceries at market' : 'e.g., Monthly salary deposit'}
          className="w-full px-3 py-2.5 text-sm bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
        />
      </div>

      <div>
        <label htmlFor="tx-date" className="block text-xs font-medium text-[#4A4740] mb-1.5">
          Transaction date
        </label>
        <input
          id="tx-date"
          type="date"
          min={bounds.min}
          max={bounds.max}
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-white border border-[#D8D4CC] rounded-lg text-[#1C1B18] focus:outline-none focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E2DC]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-[#355482] hover:bg-[#29436A] rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? 'Saving...' : transaction ? 'Save changes' : 'Save transaction'}
        </button>
      </div>
    </form>
  );
}

export default function TransactionModal({
  open,
  onClose,
  plan,
  transaction = null,
  defaultType = 'EXPENSE',
  onSuccess,
}) {
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
