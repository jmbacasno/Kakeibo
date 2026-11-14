import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '../utils/formatters';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (period: { month: number; year: number }) => void;
}

export default function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const handlePrev = () => {
    if (month === 1) {
      onChange({ month: 12, year: year - 1 });
    } else {
      onChange({ month: month - 1, year });
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange({ month: 1, year: year + 1 });
    } else {
      onChange({ month: month + 1, year });
    }
  };

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 4; y <= currentYear + 2; y += 1) {
    years.push(y);
  }
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => a - b);

  return (
    <div className="inline-flex items-center bg-surface border border-line-strong rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous month"
        className="px-2.5 py-2 text-ink-secondary hover:bg-subtle hover:text-ink transition-colors border-r border-line focus-visible:outline-2 focus-visible:outline-accent-text"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 px-2">
        <label htmlFor="period-month" className="sr-only">
          Month
        </label>
        <select
          id="period-month"
          value={month}
          onChange={(e) => onChange({ month: Number(e.target.value), year })}
          className="bg-surface py-1.5 pl-1 pr-1 text-sm font-medium text-ink focus:outline-none cursor-pointer"
        >
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx + 1} className="bg-surface text-ink">
              {name}
            </option>
          ))}
        </select>

        <label htmlFor="period-year" className="sr-only">
          Year
        </label>
        <select
          id="period-year"
          value={year}
          onChange={(e) => onChange({ month, year: Number(e.target.value) })}
          className="bg-surface py-1.5 px-1 text-sm font-mono tabular-nums font-medium text-ink focus:outline-none cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y} className="bg-surface text-ink">
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next month"
        className="px-2.5 py-2 text-ink-secondary hover:bg-subtle hover:text-ink transition-colors border-l border-line focus-visible:outline-2 focus-visible:outline-accent-text"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
