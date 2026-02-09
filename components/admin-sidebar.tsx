'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type AdminNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  kind?: 'admin' | 'back';
};

const adminNavItems: AdminNavItem[] = [
  {
    href: '/admin',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/admin/templates',
    label: 'Templates',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/admin/quota',
    label: 'AI Quota',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/admin/subscriptions',
    label: 'Subscriptions',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/admin/feedback',
    label: 'User Feedback',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    kind: 'admin',
  },
  {
    href: '/dashboard',
    label: 'Back to App',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    kind: 'back',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, kind: AdminNavItem['kind']) => {
    if (kind === 'admin') {
      return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getItemClass = (item: AdminNavItem) => {
    const active = isActive(item.href, item.kind);

    if (active) {
      return 'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
    }

    if (item.kind === 'back') {
      return 'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800';
    }

    return 'flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-bold hover:bg-primary/10 hover:text-primary';
  };

  return (
    <div className="glass rounded-[2rem] p-6 border border-border/50 sticky top-24">
      <h2 className="text-xl font-black mb-6 px-2">Management</h2>
      <nav className="space-y-2">
        {adminNavItems.map((item) => (
          <Link key={item.href} href={item.href} className={getItemClass(item)}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
