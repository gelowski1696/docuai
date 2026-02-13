'use client';

export default function ReviewStep({
  templateName,
  goal,
  format,
  tone,
  designName,
  experienceLevel,
  estimatedSeconds,
  fieldCount,
}: {
  templateName?: string;
  goal: string;
  format: 'DOCX' | 'PDF' | 'XLSX';
  tone?: string;
  designName?: string;
  experienceLevel: 'non_technical' | 'general' | 'technical';
  estimatedSeconds: number;
  fieldCount: number;
}) {
  return (
    <div className="rounded-3xl border border-border/50 bg-white/60 dark:bg-slate-900/50 p-6 space-y-4">
      <h3 className="text-xl font-black">Review Before Generate</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Quick summary before we generate. You can still go back and edit anything.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Goal</div>
          <div className="font-semibold mt-1">{goal || 'Not selected'}</div>
        </div>
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Template</div>
          <div className="font-semibold mt-1">{templateName || 'Not selected'}</div>
        </div>
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Output Format</div>
          <div className="font-semibold mt-1">{format}</div>
        </div>
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Design</div>
          <div className="font-semibold mt-1">{designName || 'Default design'}</div>
        </div>
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tone</div>
          <div className="font-semibold mt-1">{tone || 'Default'}</div>
        </div>
        <div className="rounded-xl border border-border/40 p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile</div>
          <div className="font-semibold mt-1">{experienceLevel.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3">
        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          Estimated time: ~{estimatedSeconds}s. We captured {fieldCount} input value{fieldCount === 1 ? '' : 's'}.
        </p>
      </div>
    </div>
  );
}
