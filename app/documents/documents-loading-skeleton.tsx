export default function DocumentsLoadingSkeleton() {
  return (
    <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl animate-pulse">
      <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-44 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
