export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/60 rounded-xl" />
          <div className="h-3 w-64 bg-muted/40 rounded-lg" />
        </div>
        <div className="h-9 w-24 bg-muted/60 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3"
          >
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-8 w-16 bg-muted/70 rounded-lg" />
            <div className="h-2 w-full bg-muted/40 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-8 p-6 rounded-3xl border border-border/60 bg-card/40 space-y-4">
          <div className="h-5 w-40 bg-muted/60 rounded" />
          <div className="h-56 w-full bg-muted/30 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 p-6 rounded-3xl border border-border/60 bg-card/40 space-y-4">
          <div className="h-5 w-32 bg-muted/60 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-muted/30 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
