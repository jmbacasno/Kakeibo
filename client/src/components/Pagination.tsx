import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

export default function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-line text-sm">
      <span className="text-xs text-ink-muted font-mono tabular-nums">
        Page {page} of {totalPages} · {total} {total === 1 ? 'record' : 'records'}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
