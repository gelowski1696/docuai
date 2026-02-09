export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50 bg-card/70 backdrop-blur-sm" />
      <main className="max-w-3xl mx-auto px-4 py-20 relative animate-pulse">
        <div className="text-center mb-16">
          <div className="h-12 w-80 bg-muted rounded-xl mb-6 mx-auto" />
          <div className="h-5 w-[36rem] max-w-full bg-muted rounded mx-auto" />
        </div>

        <div className="glass rounded-[2rem] border border-border/50 p-8 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded-xl" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-28 w-full bg-muted rounded-2xl" />
          </div>
          <div className="h-14 w-full bg-muted rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

