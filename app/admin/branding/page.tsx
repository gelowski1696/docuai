'use client';

import { useEffect, useState } from 'react';
import { getBrandSettings, updateBrandSettings } from '@/app/actions/admin-branding';

type BrandSettingsState = {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
};

const DEFAULT_STATE: BrandSettingsState = {
  logoUrl: '',
  primaryColor: '#2563EB',
  secondaryColor: '#4F46E5',
  fontHeading: 'Inter',
  fontBody: 'Roboto',
};

export default function AdminBrandingPage() {
  const [form, setForm] = useState<BrandSettingsState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getBrandSettings();
      if (result.success && result.settings) {
        setForm({
          logoUrl: result.settings.logoUrl || '',
          primaryColor: result.settings.primaryColor || '#2563EB',
          secondaryColor: result.settings.secondaryColor || '#4F46E5',
          fontHeading: result.settings.fontHeading || 'Inter',
          fontBody: result.settings.fontBody || 'Roboto',
        });
      } else if (!result.success) {
        setError(result.error || 'Failed to load brand settings');
      }
      setLoading(false);
    };

    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const result = await updateBrandSettings({
      logoUrl: form.logoUrl || undefined,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      fontHeading: form.fontHeading,
      fontBody: form.fontBody,
    });

    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Failed to save brand settings');
      return;
    }

    setMessage('Brand settings updated.');
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Branding</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Configure organization-level brand variables used by design templates.
        </p>
      </header>

      <section className="rounded-3xl border border-border/40 p-6 sm:p-8 bg-white/40 dark:bg-slate-900/40">
        {loading ? (
          <p className="text-sm text-gray-500">Loading branding settings...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-black">Logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(event) => setForm({ ...form, logoUrl: event.target.value })}
                placeholder="https://example.com/logo.png"
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black">Primary Color</label>
                <input
                  value={form.primaryColor}
                  onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
                  placeholder="#2563EB"
                  className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black">Secondary Color</label>
                <input
                  value={form.secondaryColor}
                  onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })}
                  placeholder="#4F46E5"
                  className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black">Heading Font</label>
                <input
                  value={form.fontHeading}
                  onChange={(event) => setForm({ ...form, fontHeading: event.target.value })}
                  placeholder="Inter"
                  className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black">Body Font</label>
                <input
                  value={form.fontBody}
                  onChange={(event) => setForm({ ...form, fontBody: event.target.value })}
                  placeholder="Roboto"
                  className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Branding'}
            </button>
          </form>
        )}
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-bold">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
