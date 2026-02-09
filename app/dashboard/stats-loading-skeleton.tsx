export function StatsLoadingSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass rounded-3xl p-8 border border-border/50">
          <div className="h-4 w-24 bg-muted rounded mb-4" />
          <div className="h-10 w-20 bg-muted rounded mb-3" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      ))}
    </section>
  );
}
