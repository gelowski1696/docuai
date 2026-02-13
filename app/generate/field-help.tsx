'use client';

export default function FieldHelp({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">{title}</p>
      <p className="text-sm text-indigo-700 dark:text-indigo-300">{hint}</p>
    </div>
  );
}
