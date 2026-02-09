export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-72 bg-muted rounded-xl" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-3xl p-8 border border-border/50">
            <div className="h-10 w-10 bg-muted rounded-xl mb-4" />
            <div className="h-7 w-20 bg-muted rounded mb-2" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] p-8 border border-border/50 space-y-4">
        <div className="h-6 w-56 bg-muted rounded" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-4 w-full bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
