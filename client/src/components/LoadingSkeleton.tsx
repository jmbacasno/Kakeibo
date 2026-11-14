export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-4 w-1/3 bg-subtle-strong rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 w-full bg-subtle rounded" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-surface border border-line rounded-xl p-5 space-y-3">
            <div className="h-3 w-24 bg-subtle-strong rounded" />
            <div className="h-7 w-32 bg-subtle-strong rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-surface border border-line rounded-xl" />
        <div className="h-64 bg-surface border border-line rounded-xl" />
      </div>
    </div>
  );
}
