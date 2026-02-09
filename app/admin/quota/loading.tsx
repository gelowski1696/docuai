export default function Loading() {
  return (
    <div className="space-y-12 animate-pulse">
      <div>
        <div className="h-10 w-72 bg-muted rounded-xl mb-3" />
        <div className="h-5 w-96 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-border/50 shadow-sm">
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-10 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-gray-900/50 p-10 rounded-[2.5rem] border border-border/50 shadow-sm space-y-4">
          <div className="h-8 w-56 bg-muted rounded mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-muted rounded" />
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-10 rounded-[2.5rem] border border-border/50 shadow-sm space-y-4">
          <div className="h-8 w-56 bg-muted rounded mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
