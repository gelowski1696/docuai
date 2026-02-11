'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  user?: {
    email: string;
    role: string;
    subscriptionTier?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getDesktopNavClass = (href: string) =>
    `px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActiveRoute(href)
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
    }`;

  const getMobileNavClass = (href: string) =>
    `px-4 py-3 text-base font-bold rounded-xl transition-all ${
      isActiveRoute(href)
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
        : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
    }`;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              DocuAI
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className={getDesktopNavClass('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/generate" className={getDesktopNavClass('/generate')}>
                Generate
              </Link>
              <Link href="/documents" className={getDesktopNavClass('/documents')}>
                Documents
              </Link>
              <Link href="/pricing" className={getDesktopNavClass('/pricing')}>
                Pricing
              </Link>
              <Link href="/support" className={getDesktopNavClass('/support')}>
                Support
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className={getDesktopNavClass('/admin')}>
                  Admin
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {user && (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden lg:inline">{user.email}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                      {user.role}
                    </span>
                    <div
                      className={`mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                        user.subscriptionTier === 'ENTERPRISE'
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                          : user.subscriptionTier === 'PRO'
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                            : user.subscriptionTier === 'STARTER'
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <span className="text-[14px]">
                        {user.subscriptionTier === 'ENTERPRISE'
                          ? '??'
                          : user.subscriptionTier === 'PRO'
                            ? '?'
                            : user.subscriptionTier === 'STARTER'
                              ? '??'
                              : '??'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{user.subscriptionTier || 'FREE'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-bold text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 border border-transparent hover:border-border/50"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {user && mobileMenuOpen && (
          <div className="md:hidden py-5 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-2">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Generate', href: '/generate' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'My Documents', href: '/documents' },
                { label: 'Support', href: '/support' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getMobileNavClass(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={getMobileNavClass('/admin')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <div className="mt-4 pt-6 border-t border-gray-100 dark:border-gray-800 px-4">
                <div className="flex items-center justify-between mb-6 gap-3">
                  <div className="flex flex-col min-w-0">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account</div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[180px]">{user.email}</div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                      user.subscriptionTier === 'ENTERPRISE'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                        : user.subscriptionTier === 'PRO'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                          : user.subscriptionTier === 'STARTER'
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="text-sm">
                      {user.subscriptionTier === 'ENTERPRISE'
                        ? '??'
                        : user.subscriptionTier === 'PRO'
                          ? '?'
                          : user.subscriptionTier === 'STARTER'
                            ? '??'
                            : '??'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{user.subscriptionTier || 'FREE'}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full py-4 bg-gray-50 dark:bg-gray-800/50 text-red-500 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
