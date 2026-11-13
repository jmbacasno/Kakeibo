import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpenCheck,
  CalendarRange,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/ToastProvider';
import { fetchCurrentPlan, setSelectedPeriod } from '../features/plans/planSlice';
import {
  createReflection,
  deleteReflection,
  fetchReflections,
  updateReflection,
} from '../features/reflections/reflectionSlice';
import { MonthlyPlan, MonthlyReflection } from '../types/models';
import { formatCurrency, formatDateTimeDisplay, formatMonthYear } from '../utils/formatters';

const SUGGESTED_PROMPTS = [
  'How much money did I save?',
  'Did I achieve my savings goal?',
  'What did I spend too much on?',
  'Which purchases were worthwhile?',
  'What could I improve next month?',
];

interface ReflectionEditorProps {
  currentPlan: MonthlyPlan;
  currentReflection: MonthlyReflection | null;
  onRequestDelete: () => void;
}

function ReflectionEditor({
  currentPlan,
  currentReflection,
  onRequestDelete,
}: ReflectionEditorProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [content, setContent] = useState(currentReflection?.content || '');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const insertPrompt = (promptText: string) => {
    setContent((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return `${promptText}\n`;
      return `${trimmed}\n\n${promptText}\n`;
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!content.trim()) {
      setFormError('Please write your reflection before saving.');
      return;
    }

    setSaving(true);
    if (currentReflection) {
      const res = await dispatch(
        updateReflection({ id: currentReflection.id, content: content.trim() })
      );
      setSaving(false);
      if (updateReflection.fulfilled.match(res)) {
        toast.success('Monthly reflection updated.');
      } else {
        setFormError(res.payload || 'Unable to update reflection.');
      }
    } else {
      const res = await dispatch(
        createReflection({ monthlyPlanId: currentPlan.id, content: content.trim() })
      );
      setSaving(false);
      if (createReflection.fulfilled.match(res)) {
        toast.success('Monthly reflection saved.');
      } else {
        setFormError(res.payload || 'Unable to save reflection.');
      }
    }
  };

  return (
    <section className="lg:col-span-7 bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E2DC] pb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1C1B18] flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-[#355482]" />
            <span>
              {currentReflection ? 'Your Monthly Reflection' : 'Write Monthly Reflection'}
            </span>
          </h3>
          <p className="text-xs text-[#6B675E] mt-0.5">
            {currentReflection
              ? `Last updated ${formatDateTimeDisplay(currentReflection.updatedAt)}`
              : 'One reflection per monthly plan. Use optional prompts below if helpful.'}
          </p>
        </div>

        {currentReflection && (
          <button
            type="button"
            onClick={onRequestDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B83B3B] bg-white border border-[#E8C5C5] rounded-lg hover:bg-[#FDF6F6] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-[#6B675E] mb-2">
          Optional Kakeibo prompts (click to insert into editor):
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => insertPrompt(q)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#355482] bg-[#EEF2F7] hover:bg-[#E1E8F2] rounded-md transition-colors text-left"
            >
              <Plus className="w-3 h-3 shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] px-3.5 py-2.5 text-sm text-[#8F2A2A]"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="reflection-editor" className="sr-only">
            Monthly reflection content
          </label>
          <textarea
            id="reflection-editor"
            rows={11}
            maxLength={10000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a quiet moment to write about what went well this month, what surprised you, and one gentle adjustment for next month..."
            className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-[#D8D4CC] rounded-lg text-[#1C1B18] leading-relaxed focus:outline-none focus:bg-white focus:border-[#355482] focus:ring-2 focus:ring-[#355482]/15"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? 'Saving...'
                : currentReflection
                ? 'Update reflection'
                : 'Save reflection'}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default function ReflectionsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { selectedMonth, selectedYear, currentPlan, loading: planLoading } = useAppSelector(
    (state) => state.plans
  );
  const { items: reflections, loading } = useAppSelector((state) => state.reflections);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentPlan({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchReflections());
  }, [dispatch, selectedMonth, selectedYear]);

  const isPeriodMismatch = Boolean(
    currentPlan && (currentPlan.month !== selectedMonth || currentPlan.year !== selectedYear)
  );

  const activePlan = isPeriodMismatch ? null : currentPlan;
  const currentReflection = activePlan
    ? reflections.find((r) => r.monthlyPlanId === activePlan.id) || null
    : null;

  const handleDelete = async () => {
    if (!currentReflection) return;
    setDeleting(true);
    const res = await dispatch(deleteReflection(currentReflection.id));
    setDeleting(false);
    if (deleteReflection.fulfilled.match(res)) {
      toast.success('Reflection deleted.');
      setConfirmDeleteOpen(false);
    } else {
      toast.error(res.payload || 'Unable to delete reflection.');
    }
  };

  const summary = activePlan?.summary || null;
  const pastReflections = reflections.filter((r) => r.monthlyPlanId !== activePlan?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#1C1B18]">
          {formatMonthYear(selectedMonth, selectedYear)} Reflection
        </h2>
        <p className="text-xs text-[#6B675E] mt-1">
          Review the month’s numbers calmly and reflect on your spending habits
        </p>
      </div>

      {planLoading || isPeriodMismatch ? (
        <CardSkeleton rows={5} />
      ) : !activePlan || !summary ? (
        <EmptyState
          icon={CalendarRange}
          title={`No plan for ${formatMonthYear(selectedMonth, selectedYear)}`}
          description="Create a monthly plan first so your income, budgets, and expenses can be summarized before writing a reflection."
          action={
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#355482] hover:bg-[#29436A] text-white text-sm font-medium rounded-lg"
            >
              Create monthly plan
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-5 space-y-6">
            <section className="bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1B18]">Month-End Financial Review</h3>
                <p className="text-xs text-[#6B675E] mt-0.5">
                  Actual outcomes for {formatMonthYear(activePlan.month, activePlan.year)}
                </p>
              </div>

              <div className="space-y-3 text-sm border-t border-b border-[#E5E2DC] py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B675E]">Planned vs. Actual income</span>
                  <span className="font-mono tabular-nums text-[#1C1B18]">
                    {formatCurrency(summary.plannedIncome)} /{' '}
                    <strong className="text-[#2A6F4E]">
                      {formatCurrency(summary.actualIncome)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B675E]">Savings goal vs. Actual</span>
                  <span className="font-mono tabular-nums text-[#1C1B18]">
                    {formatCurrency(summary.savingsGoal)} /{' '}
                    <strong
                      className={
                        summary.actualSavings >= summary.savingsGoal
                          ? 'text-[#2A6F4E]'
                          : 'text-[#B83B3B]'
                      }
                    >
                      {formatCurrency(summary.actualSavings)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B675E]">Total expenses</span>
                  <span className="font-mono tabular-nums font-medium text-[#1C1B18]">
                    {formatCurrency(summary.totalExpenses)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B675E]">Remaining budget</span>
                  <span
                    className={`font-mono tabular-nums font-medium ${
                      summary.remainingBudget < 0 ? 'text-[#B83B3B]' : 'text-[#2A6F4E]'
                    }`}
                  >
                    {formatCurrency(summary.remainingBudget)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#1C1B18] mb-2">
                  Categories exceeding budget
                </h4>
                {summary.overBudgetCategories.length === 0 ? (
                  <p className="inline-flex items-center gap-1.5 text-xs text-[#2A6F4E]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All categories stayed within their allocated limits.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {summary.overBudgetCategories.map((cat) => (
                      <li
                        key={cat.categoryId}
                        className="flex items-center justify-between text-xs text-[#B83B3B]"
                      >
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {cat.categoryName}
                        </span>
                        <span className="font-mono tabular-nums">
                          +{formatCurrency(cat.actualSpent - cat.allocatedAmount)} over
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5E2DC]">
                <h4 className="text-xs font-semibold text-[#1C1B18] mb-2.5">
                  Expense breakdown by category
                </h4>
                {summary.categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-[#6B675E]">No expenses recorded for this month.</p>
                ) : (
                  <div className="space-y-2">
                    {summary.categoryBreakdown.map((cat) => (
                      <div
                        key={cat.categoryId}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#4A4740]">{cat.categoryName}</span>
                        <span className="font-mono tabular-nums text-[#1C1B18]">
                          {formatCurrency(cat.actualSpent)}{' '}
                          <span className="text-[#6B675E]">
                            / {formatCurrency(cat.allocatedAmount)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>

          <ReflectionEditor
            key={`${activePlan.id}-${currentReflection?.id || 'new'}-${currentReflection?.updatedAt || ''}`}
            currentPlan={activePlan}
            currentReflection={currentReflection}
            onRequestDelete={() => setConfirmDeleteOpen(true)}
          />
        </div>
      )}

      {!loading && pastReflections.length > 0 && (
        <section className="bg-white border border-[#E5E2DC] rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1C1B18]">Past Reflections</h3>
            <p className="text-xs text-[#6B675E] mt-0.5">
              Revisit reflections from earlier months
            </p>
          </div>

          <div className="divide-y divide-[#E5E2DC]">
            {pastReflections.map((r) => (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  {r.monthlyPlan ? (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          setSelectedPeriod({
                            month: r.monthlyPlan!.month,
                            year: r.monthlyPlan!.year,
                          })
                        )
                      }
                      className="text-sm font-semibold text-[#355482] hover:underline"
                    >
                      {formatMonthYear(r.monthlyPlan.month, r.monthlyPlan.year)}
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-[#1C1B18]">Monthly reflection</span>
                  )}
                  <span className="text-xs text-[#6B675E] font-mono tabular-nums">
                    {formatDateTimeDisplay(r.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-[#3A3832] whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete monthly reflection"
        message="Are you sure you want to delete your reflection for this month? You can write a new one later if needed."
        loading={deleting}
      />
    </div>
  );
}
