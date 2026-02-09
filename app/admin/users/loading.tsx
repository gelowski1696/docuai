export default function Loading() {
  return (
    <div className="space-y-12 animate-pulse">
      <header>
        <div className="h-10 w-72 bg-muted rounded-xl mb-4" />
        <div className="h-5 w-96 bg-muted rounded" />
      </header>

      <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 py-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
            <div className="h-7 w-20 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
