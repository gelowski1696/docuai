export default function Loading() {
  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0f1e] text-foreground overflow-x-hidden">
      <main className="relative pt-32 pb-32 px-4 md:px-8 max-w-7xl mx-auto animate-pulse">
        <div className="text-center mb-24 space-y-6">
          <div className="h-16 w-[32rem] max-w-full bg-muted rounded-2xl mx-auto" />
          <div className="h-5 w-[34rem] max-w-full bg-muted rounded mx-auto" />
          <div className="h-12 w-72 bg-muted rounded-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-[3rem] p-8 border border-border/50">
              <div className="h-6 w-36 bg-muted rounded mb-4" />
              <div className="h-10 w-28 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded mb-8" />
              <div className="space-y-3 mb-10">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="h-4 w-full bg-muted rounded" />
                ))}
              </div>
              <div className="h-14 w-full bg-muted rounded-2xl" />
            </div>
          ))}
        </div>

        <section className="glass rounded-[2rem] border border-border/50 p-8 md:p-10">
          <div className="h-8 w-56 bg-muted rounded mb-6" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-muted rounded" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

