'use client';

import { useState } from 'react';
import { submitFeedback } from '@/app/actions/feedback';
import { useRouter } from 'next/navigation';

export default function SupportForm() {
  const router = useRouter();
  const [type, setType] = useState<'ERROR' | 'SUGGESTION'>('SUGGESTION');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await submitFeedback({ type, title, content, priority });

    if (result.success) {
      setMessage({ type: 'success', text: 'Thank you! Your feedback has been submitted.' });
      setTitle('');
      setContent('');
      // Redirect after a short delay
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong.' });
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 md:p-12 border border-border/50 shadow-2xl relative">
      {message && (
        <div className={`mb-8 p-6 rounded-2xl border ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        } font-medium flex items-center animate-in fade-in slide-in-from-top-4 duration-300`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Submission Type</label>
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('SUGGESTION')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  type === 'SUGGESTION' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-500'
                }`}
              >
                Suggestion
              </button>
              <button
                type="button"
                onClick={() => setType('ERROR')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  type === 'ERROR' ? 'bg-white dark:bg-gray-700 shadow-md text-red-500' : 'text-gray-500'
                }`}
              >
                Bug / Error
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Priority (Optional)</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-[60px] px-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="LOW">Low - No rush</option>
              <option value="MEDIUM">Medium - Normal</option>
              <option value="HIGH">High - Urgent</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Summary *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'SUGGESTION' ? 'e.g. Add dark mode toggle to editor' : 'e.g. PDF export fails on Safari'}
            className="w-full h-16 px-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Details *</label>
          <textarea
            required
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={type === 'SUGGESTION' ? 'Describe your idea in detail...' : 'Please describe the steps to reproduce the error...'}
            className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-3xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 sm:h-20 rounded-[1.25rem] sm:rounded-[2rem] bg-primary text-white font-black text-lg sm:text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Send Feedback'
          )}
        </button>
      </form>
    </div>
  );
}
