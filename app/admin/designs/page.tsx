'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createDesignTemplate,
  getAllDesignTemplates,
  setDefaultDesignTemplate,
  toggleDesignTemplateStatus,
  updateDesignTemplate,
} from '@/app/actions/admin-designs';

type DesignTemplateRow = {
  id: string;
  name: string;
  description?: string | null;
  previewImage?: string | null;
  targetFormats: string;
  tokens: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
};

const INITIAL_FORM = {
  name: '',
  description: '',
  previewImage: '',
  targetFormats: 'DOCX,PDF',
  tokensJson: JSON.stringify(
    {
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      headingColor: '#1E293B',
      bodyColor: '#334155',
      fontHeading: 'Inter',
      fontBody: 'Roboto',
      spacingScale: 'normal',
      tableStyle: 'clean',
      coverStyle: 'classic',
    },
    null,
    2
  ),
  isActive: true,
};

function prettyTokens(tokensRaw: string) {
  try {
    return JSON.stringify(JSON.parse(tokensRaw), null, 2);
  } catch {
    return tokensRaw;
  }
}

export default function AdminDesignsPage() {
  const [rows, setRows] = useState<DesignTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const pageTitle = useMemo(
    () => (editingId ? 'Edit Design Template' : 'Create Design Template'),
    [editingId]
  );

  const refresh = async () => {
    setLoading(true);
    setError('');
    const result = await getAllDesignTemplates();
    if (result.success) {
      setRows((result.templates || []) as DesignTemplateRow[]);
    } else {
      setError(result.error || 'Failed to load design templates');
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      previewImage: form.previewImage.trim(),
      targetFormats: form.targetFormats.trim().toUpperCase(),
      tokensJson: form.tokensJson,
      isActive: form.isActive,
    };

    const result = editingId
      ? await updateDesignTemplate(editingId, payload)
      : await createDesignTemplate(payload);

    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Failed to save design template');
      return;
    }

    resetForm();
    await refresh();
  };

  const startEdit = (row: DesignTemplateRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      description: row.description || '',
      previewImage: row.previewImage || '',
      targetFormats: row.targetFormats,
      tokensJson: prettyTokens(row.tokens),
      isActive: row.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Design Templates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage reusable visual styles for DOCX/PDF document generation.
        </p>
      </header>

      <section className="rounded-3xl border border-border/40 p-6 sm:p-8 bg-white/40 dark:bg-slate-900/40">
        <h2 className="text-xl font-black mb-5">{pageTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Template name"
              required
              className="h-11 rounded-xl border border-border/50 bg-background px-4"
            />
            <input
              value={form.targetFormats}
              onChange={(event) => setForm({ ...form, targetFormats: event.target.value })}
              placeholder="DOCX,PDF"
              required
              className="h-11 rounded-xl border border-border/50 bg-background px-4 uppercase"
            />
          </div>

          <input
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Description"
            className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
          />

          <input
            value={form.previewImage}
            onChange={(event) => setForm({ ...form, previewImage: event.target.value })}
            placeholder="Preview image URL (optional)"
            className="h-11 w-full rounded-xl border border-border/50 bg-background px-4"
          />

          <textarea
            value={form.tokensJson}
            onChange={(event) => setForm({ ...form, tokensJson: event.target.value })}
            rows={10}
            className="w-full rounded-xl border border-border/50 bg-background p-4 font-mono text-xs"
          />

          <label className="inline-flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Active
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="h-10 px-4 rounded-xl border border-border/50 font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-border/40 p-6 sm:p-8 bg-white/40 dark:bg-slate-900/40">
        <h2 className="text-xl font-black mb-5">Existing Templates</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading templates...</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-border/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black">{row.name}</span>
                    {row.isDefault && (
                      <span className="text-[10px] px-2 py-1 rounded-full border border-emerald-300 text-emerald-700 font-black uppercase tracking-widest">
                        Default
                      </span>
                    )}
                    {!row.isActive && (
                      <span className="text-[10px] px-2 py-1 rounded-full border border-amber-300 text-amber-700 font-black uppercase tracking-widest">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{row.description || 'No description'}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Formats: {row.targetFormats}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="h-9 px-3 rounded-lg border border-border/50 text-sm font-bold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await toggleDesignTemplateStatus(row.id, !row.isActive);
                      await refresh();
                    }}
                    className="h-9 px-3 rounded-lg border border-border/50 text-sm font-bold"
                  >
                    {row.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    disabled={row.isDefault}
                    onClick={async () => {
                      await setDefaultDesignTemplate(row.id);
                      await refresh();
                    }}
                    className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm font-bold disabled:opacity-50"
                  >
                    Set Default
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
