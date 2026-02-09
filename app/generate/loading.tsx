export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative animate-pulse">
        <div className="mb-10">
          <div className="h-10 w-80 bg-muted rounded-xl mb-4" />
          <div className="h-5 w-[34rem] bg-muted rounded" />
        </div>

        <div className="mb-10 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="h-1 w-16 rounded-full bg-muted" />
          <div className="h-10 w-10 rounded-full bg-muted" />
        </div>

        <div className="mb-10 h-24 rounded-3xl border border-border/50 glass p-6">
          <div className="h-4 w-56 bg-muted rounded mb-3" />
          <div className="h-3 w-64 bg-muted rounded" />
        </div>

        <div className="flex gap-8">
          <div className="w-64 hidden lg:block space-y-4">
            <div className="h-40 rounded-2xl bg-muted" />
            <div className="h-28 rounded-2xl bg-muted" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-12 rounded-xl bg-muted" />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

