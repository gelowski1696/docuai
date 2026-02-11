'use client';

import { useEffect, useState } from 'react';
import { updateUserTier } from '@/app/actions/admin-users';
import { useRouter } from 'next/navigation';

const TIER_OPTIONS = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as const;

export default function TierEditor({ userId, currentTier }: { userId: string; currentTier: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleSave = async () => {
    if (selectedTier === currentTier) return;
    if (!confirm(`Are you sure you want to change this user tier to ${selectedTier}?`)) return;

    setLoading(true);
    const result = await updateUserTier(userId, selectedTier);
    setLoading(false);

    if (result.success) {
      router.refresh();
      setNotification({ type: 'success', message: `User tier changed to ${selectedTier}.` });
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to update tier' });
    }
  };

  return (
    <>
      {notification && (
        <div
          className={`fixed bottom-8 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          disabled={loading}
          className="h-10 min-w-[128px] rounded-xl border border-border/50 bg-white dark:bg-slate-900 px-3 text-sm font-bold"
        >
          {TIER_OPTIONS.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={loading || selectedTier === currentTier}
          className="h-10 px-4 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </>
  );
}
