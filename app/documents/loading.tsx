export default function Loading() {
  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 dark:selection:bg-indigo-900 relative overflow-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative animate-pulse">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="h-12 w-72 bg-muted rounded-xl mb-4 mx-auto md:mx-0" />
            <div className="h-5 w-96 bg-muted rounded mx-auto md:mx-0" />
          </div>
          <div className="h-14 w-56 rounded-2xl bg-muted" />
        </header>

        <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl">
          <div className="p-8 space-y-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-6">
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
      </main>
    </div>
  );
}

