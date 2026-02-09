export default function Loading() {
  return (
    <div className="space-y-12 animate-pulse">
      <header>
        <div className="h-4 w-28 bg-muted rounded mb-3" />
        <div className="h-10 w-72 bg-muted rounded-xl mb-4" />
        <div className="h-5 w-[34rem] bg-muted rounded" />
      </header>

      <div className="glass rounded-[2.5rem] border border-border/50 p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 p-5 space-y-3">
            <div className="h-5 w-64 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
