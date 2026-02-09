'use client';

import { useState } from 'react';
import { updateFeedbackStatus } from '@/app/actions/feedback';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackItem {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  user: {
    email: string;
  };
}

export default function FeedbackList({ initialFeedback }: { initialFeedback: FeedbackItem[] }) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    const result = await updateFeedbackStatus(id, newStatus as any);
    if (result.success) {
      setFeedback(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
    setLoadingId(null);
  };

  const filteredItems = feedback.filter(item => {
    const typeMatch = filterType === 'ALL' || item.type === filterType;
    const statusMatch = filterStatus === 'ALL' || item.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const statusCounts = {
    ALL: feedback.length,
    PENDING: feedback.filter(f => f.status === 'PENDING').length,
    IN_PROGRESS: feedback.filter(f => f.status === 'IN_PROGRESS').length,
    RESOLVED: feedback.filter(f => f.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: statusCounts.ALL, color: 'from-indigo-500 to-purple-600' },
          { label: 'Pending', count: statusCounts.PENDING, color: 'from-amber-500 to-orange-600' },
          { label: 'In Progress', count: statusCounts.IN_PROGRESS, color: 'from-blue-500 to-cyan-600' },
          { label: 'Resolved', count: statusCounts.RESOLVED, color: 'from-emerald-500 to-teal-600' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6 border border-border/50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-2xl font-black mb-1">{stat.count}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-3xl p-6 border border-border/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Type</label>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'ERROR', 'SUGGESTION'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === t 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === s 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 text-sm font-bold text-gray-500 text-center">
          Showing <span className="text-primary">{filteredItems.length}</span> of {feedback.length} submissions
        </div>
      </div>

      {/* Feedback Items */}
      <div className="space-y-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="glass rounded-[2rem] p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 group"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.type === 'ERROR' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {item.type}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.priority === 'HIGH' 
                      ? 'bg-amber-500 text-white' 
                      : item.priority === 'MEDIUM'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">•</span>
                  <span className="text-xs text-gray-500 font-medium">{item.user.email}</span>
                </div>
                
                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.content}
                </p>
              </div>

              {/* Actions */}
              <div className="lg:w-56 flex flex-col gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</label>
                {['PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                  <button
                    key={s}
                    disabled={loadingId === item.id || item.status === s}
                    onClick={() => handleStatusChange(item.id, s)}
                    className={`px-4 py-3 rounded-xl text-xs font-black transition-all disabled:cursor-not-allowed ${
                      item.status === s 
                        ? s === 'RESOLVED' 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : s === 'IN_PROGRESS'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50'
                    }`}
                  >
                    {loadingId === item.id && item.status !== s ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      s.replace('_', ' ')
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="glass rounded-[3rem] p-20 border border-dashed border-border/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-bold text-lg mb-2">No feedback found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}
