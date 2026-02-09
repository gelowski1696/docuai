import { getAllFeedback } from '@/app/actions/feedback';
import { getCurrentUser } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';
import FeedbackList from './feedback-list';

export default async function AdminFeedbackPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const result = await getAllFeedback();
  if (!result.success) {
    return (
      <div className="glass rounded-3xl p-12 border border-border/50 text-center">
        <div className="text-red-500 font-bold text-xl mb-2">Error Loading Feedback</div>
        <p className="text-gray-500">{result.error || 'Unable to fetch feedback data.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">Management</div>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          User <span className="gradient-text">Feedback</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Monitor system health and track feature requests from your users.
        </p>
      </header>

      <FeedbackList initialFeedback={result.feedback as any} />
    </div>
  );
}
