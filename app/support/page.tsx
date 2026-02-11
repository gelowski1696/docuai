import { getSessionUser } from '@/lib/auth/session';
import SupportForm from './support-form';

export default async function SupportPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 md:py-20 relative">
        {/* Decorative background blur */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
            How can we <span className="gradient-text">Improve</span>?
          </h1>
          <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            Spotted a bug or have a brilliant idea? We're all ears. Your feedback drives our evolution.
          </p>
        </div>

        <SupportForm />
      </main>
    </div>
  );
}
