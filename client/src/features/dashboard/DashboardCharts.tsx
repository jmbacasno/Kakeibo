import { CategoryBreakdownItem } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';

const CHART_PALETTE = [
  '#355482',
  '#5A7B9E',
  '#7E9BB8',
  '#4F7765',
  '#9C7E54',
  '#8A6475',
  '#68707A',
];

export function IncomeVsExpenseChart({
  plannedIncome,
  actualIncome,
  totalExpenses,
}: {
  plannedIncome: number;
  actualIncome: number;
  totalExpenses: number;
}) {
  const maxVal = Math.max(plannedIncome, actualIncome, totalExpenses, 1);
  const bars = [
    { label: 'Planned income', value: plannedIncome, color: '#94A3B8' },
    { label: 'Actual income', value: actualIncome, color: '#2A6F4E' },
    { label: 'Total expenses', value: totalExpenses, color: '#B83B3B' },
  ];

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-6">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-[#1C1B18]">Income vs. Expenses</h2>
          <p className="text-xs text-[#6B675E] mt-0.5">
            Actual cash flow compared to planned income
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {bars.map((bar) => {
          const widthPct = Math.min(100, Math.round((bar.value / maxVal) * 100));
          return (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#4A4740]">{bar.label}</span>
                <span className="font-mono tabular-nums font-medium text-[#1C1B18]">
                  {formatCurrency(bar.value)}
                </span>
              </div>
              <div className="h-3 w-full bg-[#F1EFEA] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{ width: `${widthPct}%`, backgroundColor: bar.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChartSlice extends CategoryBreakdownItem {
  color: string;
  fraction: number;
  isFullCircle: boolean;
  d: string;
}

export function BudgetAllocationChart({
  categoryBreakdown,
  totalAllocatedBudget,
}: {
  categoryBreakdown: CategoryBreakdownItem[];
  totalAllocatedBudget: number;
}) {
  const allocatedItems = categoryBreakdown.filter((c) => c.allocatedAmount > 0);
  const total = totalAllocatedBudget > 0 ? totalAllocatedBudget : 0;

  const radius = 56;
  const cx = 72;
  const cy = 72;

  const { slices } = allocatedItems.reduce<{ angleCursor: number; slices: ChartSlice[] }>(
    (acc, item, idx) => {
      const fraction = total > 0 ? item.allocatedAmount / total : 0;
      const angle = fraction * 360;
      const startAngle = acc.angleCursor;
      const endAngle = startAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      const largeArcFlag = angle > 180 ? 1 : 0;

      acc.slices.push({
        ...item,
        color: CHART_PALETTE[idx % CHART_PALETTE.length],
        fraction,
        isFullCircle: fraction >= 0.9999,
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      });
      acc.angleCursor = endAngle;
      return acc;
    },
    { angleCursor: -90, slices: [] }
  );

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-[#1C1B18]">Budget Allocation by Category</h2>
        <p className="text-xs text-[#6B675E] mt-0.5">Distribution of planned expense limits</p>
      </div>

      {allocatedItems.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#6B675E]">
          No category budgets allocated for this month yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <svg
              width="144"
              height="144"
              viewBox="0 0 144 144"
              role="img"
              aria-label="Budget allocation chart"
            >
              {slices.map((s) =>
                s.isFullCircle ? (
                  <circle key={s.categoryId} cx={cx} cy={cy} r={radius} fill={s.color} />
                ) : (
                  <path
                    key={s.categoryId}
                    d={s.d}
                    fill={s.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )
              )}
              <circle cx={cx} cy={cy} r={34} fill="#FFFFFF" />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                className="fill-[#6B675E] text-[9px] font-medium"
              >
                Allocated
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                className="fill-[#1C1B18] text-[11px] font-mono font-semibold"
              >
                {formatCurrency(total)}
              </text>
            </svg>
          </div>

          <div className="flex-1 w-full space-y-2.5">
            {slices.map((s) => (
              <div key={s.categoryId} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: s.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[#1C1B18] font-medium truncate">{s.categoryName}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                  <span className="text-[#6B675E]">{Math.round(s.fraction * 100)}%</span>
                  <span className="text-[#1C1B18] font-medium">
                    {formatCurrency(s.allocatedAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlannedVsActualChart({
  categoryBreakdown,
}: {
  categoryBreakdown: CategoryBreakdownItem[];
}) {
  const maxVal = Math.max(
    ...categoryBreakdown.flatMap((c) => [c.allocatedAmount, c.actualSpent]),
    1
  );

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-[#1C1B18]">Planned vs. Actual Spending</h2>
          <p className="text-xs text-[#6B675E] mt-0.5">
            Category allocations compared to actual expenses
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#6B675E]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#CBD5E1]" aria-hidden="true" />
            Planned
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#355482]" aria-hidden="true" />
            Actual
          </span>
        </div>
      </div>

      {categoryBreakdown.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#6B675E]">
          No planned budgets or expenses recorded for this month yet.
        </div>
      ) : (
        <div className="space-y-4">
          {categoryBreakdown.map((item) => {
            const plannedPct = Math.min(100, Math.round((item.allocatedAmount / maxVal) * 100));
            const actualPct = Math.min(100, Math.round((item.actualSpent / maxVal) * 100));
            return (
              <div key={item.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#1C1B18] truncate">{item.categoryName}</span>
                  <span className="font-mono tabular-nums text-[#4A4740] shrink-0">
                    {formatCurrency(item.actualSpent)} / {formatCurrency(item.allocatedAmount)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-[#F1EFEA] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#CBD5E1] rounded-sm transition-all duration-300"
                      style={{ width: `${plannedPct}%` }}
                    />
                  </div>
                  <div className="h-2 w-full bg-[#F1EFEA] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-300"
                      style={{
                        width: `${actualPct}%`,
                        backgroundColor: item.isOverBudget ? '#B83B3B' : '#355482',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SavingsProgressCard({
  savingsGoal,
  actualSavings,
  savingsProgressPercent,
}: {
  savingsGoal: number;
  actualSavings: number;
  savingsProgressPercent: number;
}) {
  const clamped = Math.min(100, Math.max(0, savingsProgressPercent));
  const goalMet = savingsGoal > 0 && actualSavings >= savingsGoal;
  const isDeficit = actualSavings < 0;

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1C1B18]">Monthly Savings Progress</h2>
            <p className="text-xs text-[#6B675E] mt-0.5">Actual income minus total expenses</p>
          </div>
          <span
            className={`text-xs font-medium ${
              goalMet
                ? 'text-[#2A6F4E]'
                : isDeficit
                ? 'text-[#B83B3B]'
                : 'text-[#355482]'
            }`}
          >
            {savingsGoal <= 0
              ? 'No goal set'
              : goalMet
              ? 'Goal reached'
              : isDeficit
              ? 'Spending exceeds income'
              : `${savingsProgressPercent.toFixed(1)}% of goal`}
          </span>
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs text-[#6B675E]">Actual savings</p>
            <p
              className={`text-2xl font-mono tabular-nums font-semibold mt-1 ${
                actualSavings >= 0 ? 'text-[#1C1B18]' : 'text-[#B83B3B]'
              }`}
            >
              {formatCurrency(actualSavings)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B675E]">Savings goal</p>
            <p className="text-lg font-mono tabular-nums font-medium text-[#4A4740] mt-1">
              {formatCurrency(savingsGoal)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 w-full bg-[#F1EFEA] rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-300"
            style={{
              width: `${clamped}%`,
              backgroundColor: goalMet ? '#2A6F4E' : '#355482',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[#6B675E] mt-2 font-mono tabular-nums">
          <span>{formatCurrency(0)}</span>
          <span>
            {savingsGoal > 0
              ? actualSavings >= savingsGoal
                ? `Exceeded goal by ${formatCurrency(actualSavings - savingsGoal)}`
                : `${formatCurrency(savingsGoal - actualSavings)} remaining to goal`
              : 'Set a savings goal in Monthly Plan'}
          </span>
        </div>
      </div>
    </div>
  );
}
