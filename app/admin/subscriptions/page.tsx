'use client';

import { useState, useEffect } from 'react';
import { getAllUsersSubscriptions } from '@/app/actions/admin-subscriptions';

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getAllUsersSubscriptions();
      if (res.success && res.users) {
        setUsers(res.users);
      } else {
        setError(res.error || 'Failed to fetch subscriptions');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.subscriptionTier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 dark:text-white">User Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor user tiers and monthly usage limits.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email or tier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 h-12 bg-white dark:bg-slate-900 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Subscription Tier</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Usage (Monthly)</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-32"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-16"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.subscriptionTier === 'PRO' 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {user.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-600 dark:text-gray-400">
                      {user.role}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              user.subscriptionTier === 'FREE' && user.usageCount >= 2 ? 'bg-red-500' : 'bg-primary'
                            }`}
                            style={{ 
                              width: `${user.subscriptionTier === 'FREE' ? Math.min((user.usageCount / 2) * 100, 100) : 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300">
                          {user.usageCount}
                          {user.subscriptionTier === 'FREE' ? '/2' : ' (Unlimited)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-500 text-right">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
