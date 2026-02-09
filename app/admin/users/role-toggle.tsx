'use client';

import { useEffect, useState } from 'react';
import { updateUserRole } from '@/app/actions/admin-users';
import { useRouter } from 'next/navigation';

export default function RoleToggle({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleToggle = async () => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change this user to ${newRole}?`)) return;

    setLoading(true);
    const result = await updateUserRole(userId, newRole);
    setLoading(false);

    if (result.success) {
      router.refresh();
      setNotification({ type: 'success', message: `User role changed to ${newRole}.` });
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to update role' });
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
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 ${
          currentRole === 'ADMIN'
            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
        }`}
      >
        {loading ? 'Updating...' : currentRole === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
      </button>
    </>
  );
}
