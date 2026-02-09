'use client';

import { useEffect, useState } from 'react';
import { getAIUsageStats, AIUsageStats } from '@/app/actions/admin-usage';

export default function AdminQuotaPage() {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAIUsageStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load usage stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-3xl border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-bold mb-2">Error Loading Stats</h2>
        <p>Could not fetch usage data from the server.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black mb-3">AI Quota Management</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor token consumption across all AI providers.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-border/50 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Total Tokens Consumed</p>
          <p className="text-4xl font-black text-primary">{stats.totalTokens.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-border/50 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Total Documents Generated</p>
          <p className="text-4xl font-black text-purple-500">{stats.totalDocs.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2rem] border border-border/50 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Avg Tokens / Doc</p>
          <p className="text-4xl font-black text-indigo-500">
            {stats.totalDocs > 0 ? Math.round(stats.totalTokens / stats.totalDocs).toLocaleString() : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Provider Breakdown */}
        <div className="bg-white dark:bg-gray-900/50 p-10 rounded-[2.5rem] border border-border/50 shadow-sm">
          <h2 className="text-2xl font-black mb-8">Provider Usage</h2>
          <div className="space-y-8">
            {stats.byProvider.map((p) => {
              const percentage = Math.round((p.totalTokens / stats.totalTokens) * 100) || 0;
              return (
                <div key={p.provider} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-bold capitalize">{p.provider}</span>
                    <span className="text-sm font-black text-gray-400">{percentage}%</span>
                  </div>
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${p.provider === 'openai' ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 tracking-tight px-1 uppercase">
                    <span>{p.totalTokens.toLocaleString()} tokens</span>
                    <span>{p.docCount} docs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Trends (Visualized as text for simplicity) */}
        <div className="bg-white dark:bg-gray-900/50 p-10 rounded-[2.5rem] border border-border/50 shadow-sm">
          <h2 className="text-2xl font-black mb-8">7-Day Usage Trend</h2>
          <div className="space-y-4">
            {stats.dailyTrends.length === 0 ? (
              <p className="text-gray-400 italic text-center py-12">No data recorded in the last 7 days.</p>
            ) : (
              stats.dailyTrends.map((day) => (
                <div key={day.date} className="flex items-center gap-6 group">
                  <span className="w-24 text-sm font-black text-gray-400 group-hover:text-primary transition-colors">{day.date}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-300" 
                      style={{ width: `${Math.min(100, (day.tokens / Math.max(...stats.dailyTrends.map(d => d.tokens))) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs font-black">{Math.round(day.tokens / 1000)}k</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
