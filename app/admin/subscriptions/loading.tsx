export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="h-10 w-80 bg-muted rounded-xl mb-3" />
          <div className="h-5 w-80 bg-muted rounded" />
        </div>
        <div className="h-12 w-full md:w-80 bg-muted rounded-2xl" />
      </div>

      <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm p-6 space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 py-3">
            <div className="h-4 w-56 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
