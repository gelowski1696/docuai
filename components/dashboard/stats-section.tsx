'use client';

import { useRouter } from 'next/navigation';

interface StatsSectionProps {
  documentCount: number;
  totalTokens: number;
  activeTemplatesCount: number;
}

export function StatsSection({ documentCount, totalTokens, activeTemplatesCount }: StatsSectionProps) {
  const router = useRouter();

  return (
    <section className="glass rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 lg:p-12 border border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6 relative">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">Workspace Analytics</h3>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">Real-time insight into your production pipeline.</p>
        </div>
        <button 
          onClick={() => router.refresh()}
          className="px-8 py-3 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all duration-500 shadow-sm"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-10 text-center relative">
        <div className="p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] bg-background/40 border border-border/50 hover:bg-background/60 transition-colors">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Documents</div>
          <div className="text-3xl sm:text-5xl font-black gradient-text">{documentCount}</div>
        </div>
        <div className="p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] bg-background/40 border border-border/50 hover:bg-background/60 transition-colors">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Total Tokens</div>
          <div className="text-3xl sm:text-5xl font-black gradient-text">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] bg-background/40 border border-border/50 hover:bg-background/60 transition-colors">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Active Templates</div>
          <div className="text-3xl sm:text-5xl font-black gradient-text">{activeTemplatesCount}</div>
        </div>
      </div>
    </section>
  );
}
