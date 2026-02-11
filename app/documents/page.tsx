import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import DocumentsData from './documents-data';
import DocumentsLoadingSkeleton from './documents-loading-skeleton';

export default async function DocumentsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 dark:selection:bg-indigo-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 sm:mb-16 gap-6 sm:gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              My <span className="gradient-text">Library</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400">
              Your collection of AI-generated professional documents.
            </p>
          </div>
          <Link
            href="/generate"
            className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center text-sm sm:text-base"
          >
            <span className="mr-2">?</span> Generate New
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>
        </header>

        <Suspense fallback={<DocumentsLoadingSkeleton />}>
          <DocumentsData userId={user.userId} />
        </Suspense>
      </main>
    </div>
  );
}
