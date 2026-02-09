'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTemplateTier } from '@/lib/templates';
import { toggleTemplateStatus, updateTemplate } from '@/app/actions/admin-templates';

export default function TemplateItem({ template }: { template: any }) {
  const [loading, setLoading] = useState(false);
  const [supportedFormats, setSupportedFormats] = useState(template.supportedFormats?.split(',') || ['DOCX', 'PDF', 'XLSX']);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();
  const formats = ['DOCX', 'PDF', 'XLSX'];

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleTemplateStatus(template.id, !template.isActive);
    setLoading(false);

    if (result.success) {
      router.refresh();
      setNotification({
        type: 'success',
        message: `Template ${template.isActive ? 'hidden' : 'activated'} successfully.`,
      });
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to update template' });
    }
  };

  const handleToggleFormat = async (format: string) => {
    let newFormats: string[];
    if (supportedFormats.includes(format)) {
      if (supportedFormats.length === 1) return;
      newFormats = supportedFormats.filter((f: string) => f !== format);
    } else {
      newFormats = [...supportedFormats, format].sort();
    }

    setLoading(true);
    setSupportedFormats(newFormats);
    const result = await updateTemplate(template.id, {
      ...template,
      supportedFormats: newFormats.join(','),
    });
    setLoading(false);

    if (result.success) {
      router.refresh();
      setNotification({ type: 'success', message: 'Supported formats updated.' });
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to update template' });
    }
  };

  const typeColor =
    template.type === 'INVOICE' ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : template.type === 'REPORT' ? 'text-blue-600 bg-blue-50 border-blue-200'
        : 'text-purple-600 bg-purple-50 border-purple-200';

  const tier = getTemplateTier(template.type);
  const tierColors = {
    FREE: 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    STARTER: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    PRO: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ENTERPRISE: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  return (
    <>
      {notification && (
        <div
          className={`fixed bottom-8 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      <div className={`glass rounded-[2rem] p-8 border transition-all duration-500 hover:shadow-2xl ${
        template.isActive ? 'border-border/50' : 'opacity-60 border-dashed border-gray-400'
      }`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${typeColor}`}>
              {template.type}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${tierColors[tier as keyof typeof tierColors]}`}>
              {tier}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${template.isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
              {template.isActive ? 'Active' : 'Hidden'}
            </span>
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                template.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                template.isActive ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-black mb-2">{template.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Refined AI schema v{template.version} • Created {new Date(template.createdAt).toLocaleDateString()}
        </p>

        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Supported Formats</p>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => {
              const isSupported = supportedFormats.includes(f);
              return (
                <button
                  key={f}
                  disabled={loading}
                  onClick={() => handleToggleFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-300 border ${
                    isSupported
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 py-3 px-4 bg-background border border-border/50 rounded-xl font-bold hover:border-primary/50 transition-all text-sm">
            Edit Blueprint
          </button>
          <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Delete Template">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
