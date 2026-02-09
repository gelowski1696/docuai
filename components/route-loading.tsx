interface RouteLoadingProps {
  label?: string;
}

export function RouteLoading({ label = 'Loading page...' }: RouteLoadingProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-transparent flex items-center justify-center px-4">
      <div className="rounded-2xl border border-border/50 bg-background/85 backdrop-blur-xl shadow-2xl px-6 py-5 min-w-[260px]">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
              <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.15em] uppercase text-primary">Loading</p>
            <p className="text-sm font-semibold">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
