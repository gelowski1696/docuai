'use client';

type DesignTemplateOption = {
  id: string;
  name: string;
  description?: string | null;
  previewImage?: string | null;
  targetFormats: string;
  isDefault: boolean;
  tokens?: string | null;
};

function supportsFormat(targetFormats: string, format: 'DOCX' | 'PDF' | 'XLSX') {
  return targetFormats
    .split(',')
    .map((f) => f.trim().toUpperCase())
    .includes(format);
}

export default function DesignPicker({
  templates,
  selectedDesignTemplateId,
  onSelect,
  format,
  showDefaultBadge,
}: {
  templates: DesignTemplateOption[];
  selectedDesignTemplateId?: string;
  onSelect: (id: string) => void;
  format: 'DOCX' | 'PDF' | 'XLSX';
  showDefaultBadge?: boolean;
}) {
  const parseTokens = (raw: string | null | undefined) => {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const isSelected = template.id === selectedDesignTemplateId;
        const isSupported = supportsFormat(template.targetFormats, format);
        const tokens = parseTokens(template.tokens);
        const primaryColor = String((tokens as any).primaryColor || '#2563EB');
        const secondaryColor = String((tokens as any).secondaryColor || '#4F46E5');
        const headingFont = String((tokens as any).fontHeading || 'Inter');
        const bodyFont = String((tokens as any).fontBody || 'Roboto');

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            disabled={!isSupported}
            className={`text-left rounded-2xl border p-5 transition-all ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-border/50 bg-white/60 dark:bg-slate-900/50 hover:border-indigo-300'
            } ${!isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-black text-base">{template.name}</div>
              {template.isDefault && showDefaultBadge && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-widest">
                  Default
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 min-h-[40px]">
              {template.description || 'No description'}
            </p>

            <div className="mb-3 rounded-xl border border-border/40 overflow-hidden">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={`${template.name} preview`}
                  className="w-full h-28 object-cover"
                />
              ) : (
                <div className="h-28 p-3 bg-white dark:bg-slate-950">
                  <div
                    className="w-full h-full rounded-lg p-3"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`,
                      border: `1px solid ${primaryColor}55`,
                    }}
                  >
                    <div className="text-[11px] font-black mb-1" style={{ color: primaryColor, fontFamily: headingFont }}>
                      SAMPLE TITLE
                    </div>
                    <div className="text-[10px] leading-relaxed" style={{ color: secondaryColor, fontFamily: bodyFont }}>
                      This is a quick visual preview of this design theme.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="w-3 h-3 rounded-full border border-border/40" style={{ backgroundColor: primaryColor }} />
                Primary
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="w-3 h-3 rounded-full border border-border/40" style={{ backgroundColor: secondaryColor }} />
                Accent
              </span>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Formats: {template.targetFormats}
            </div>

            {!isSupported && (
              <div className="mt-2 text-xs font-bold text-red-500">Not available for {format}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
