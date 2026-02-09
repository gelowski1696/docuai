export default function Loading() {
  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative animate-pulse">
        <div className="mb-16">
          <div className="h-12 w-96 bg-muted rounded-xl mb-4" />
          <div className="h-5 w-[36rem] bg-muted rounded" />
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[2.5rem] border border-border/50 bg-card/50 glass p-10 h-64">
              <div className="h-14 w-14 bg-muted rounded-2xl mb-10" />
              <div className="h-7 w-36 bg-muted rounded mb-4" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-4/5 bg-muted rounded" />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-3xl p-8 border border-border/50">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-10 w-20 bg-muted rounded mb-3" />
              <div className="h-3 w-28 bg-muted rounded" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

