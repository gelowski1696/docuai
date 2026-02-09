export default function Loading() {
  return (
    <div className="space-y-12 animate-pulse">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="h-10 w-80 bg-muted rounded-xl mb-4" />
          <div className="h-5 w-[30rem] bg-muted rounded" />
        </div>
        <div className="h-14 w-44 bg-muted rounded-2xl" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-[2rem] border border-border/50 p-8 space-y-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-10 w-28 bg-muted rounded-xl mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
