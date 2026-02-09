export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative flex flex-col md:flex-row gap-8 animate-pulse">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass rounded-[2rem] p-6 border border-border/50 sticky top-24">
            <div className="h-7 w-36 bg-muted rounded mb-6" />
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-8">
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
        </main>
      </div>
    </div>
  );
}

