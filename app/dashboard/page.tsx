import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import StatsData from './stats-data';
import { StatsLoadingSkeleton } from './stats-loading-skeleton';

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-hidden">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Animated Background Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="mb-16 relative">
          <div className="relative">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
              Welcome back, <span className="gradient-text">{sessionUser.email.split('@')[0]}</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              Your AI workspace is ready. Experience the future of document generation with DocuAI.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 relative">
          {/* Generate Document Card */}
          <Link
            href="/generate"
            className="group relative flex flex-col p-10 rounded-[2.5rem] border border-border/50 bg-card/50 glass hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white scale-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-indigo-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-3xl font-bold mb-4">Generate</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Create high-quality invoices, reports, and memos instantly with our advanced AI engine.
              </p>
            </div>
            
            <div className="mt-12 flex items-center text-primary text-lg font-bold group-hover:translate-x-3 transition-transform duration-500">
              Launch Creator
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          {/* My Documents Card */}
          <Link
            href="/documents"
            className="group relative flex flex-col p-10 rounded-[2.5rem] border border-border/50 bg-card/50 glass hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white scale-100 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl shadow-blue-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-3xl font-bold mb-4">Library</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Seamlessly access and manage your entire history of AI-generated documents in one place.
              </p>
            </div>
            
            <div className="mt-12 flex items-center text-primary text-lg font-bold group-hover:translate-x-3 transition-transform duration-500">
              View History
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          {/* Admin Panel Card */}
          {sessionUser.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="group relative flex flex-col p-10 rounded-[2.5rem] border border-border/50 bg-card/50 glass hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-purple-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-3xl font-bold mb-4">Admin</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Enterprise-grade control over templates, system health, and user performance metrics.
                </p>
              </div>
              
              <div className="mt-12 flex items-center text-primary text-lg font-bold group-hover:translate-x-3 transition-transform duration-500">
                Administration
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          )}
        </section>

        {/* Quick Stats */}
        <Suspense fallback={<StatsLoadingSkeleton />}>
          <StatsData userId={sessionUser.userId} />
        </Suspense>
      </main>
    </div>
  );
}
