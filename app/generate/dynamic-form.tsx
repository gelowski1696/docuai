'use client';

import { useMemo } from 'react';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date';
  required: boolean;
  placeholder?: string;
  hint?: string;
}

interface DynamicTemplateFormProps {
  templateStructure: string; // JSON string from database
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function DynamicTemplateForm({ 
  templateStructure, 
  formData, 
  onChange 
}: DynamicTemplateFormProps) {
  // Parse the template structure
  const fields = useMemo<FieldDefinition[]>(() => {
    try {
      const parsed = JSON.parse(templateStructure);
      return parsed.fields || [];
    } catch {
      return [];
    }
  }, [templateStructure]);

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No form fields defined for this template.</p>
      </div>
    );
  }

  const handleChange = (fieldName: string, value: string) => {
    onChange({ ...formData, [fieldName]: value });
  };

  const inputBaseClass = "w-full px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600";

  return (
    <div className="space-y-8">
      {/* Render fields in a smart grid layout */}
      {fields.map((field, index) => {
        // Group text fields in pairs, textareas get full width
        const isTextarea = field.type === 'textarea';
        const nextField = fields[index + 1];
        const isPaired = !isTextarea && nextField && nextField.type !== 'textarea';
        const isPrevPaired = index > 0 && fields[index - 1]?.type !== 'textarea' && field.type !== 'textarea';
        
        // Skip if this field is the second of a pair (already rendered)
        if (isPrevPaired && index % 2 === 1 && fields[index - 1]?.type !== 'textarea') {
          return null;
        }

        if (isTextarea) {
          // Full-width textarea
          return (
            <div key={field.name} className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                {field.label} {field.required && '*'}
              </label>
              <textarea
                required={field.required}
                rows={5}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className={`${inputBaseClass} p-6 rounded-[2rem] leading-relaxed`}
                placeholder={field.placeholder || `What should I write for ${field.label.toLowerCase()}? Use simple words.`}
              />
              {field.hint && (
                <p className="text-xs text-gray-400 ml-2 italic">{field.hint}</p>
              )}
              {!field.hint && (
                <p className="text-xs text-gray-400 ml-2 italic">Tip: Keep this short and clear. AI will format it.</p>
              )}
            </div>
          );
        }

        // Paired or single text/date fields
        const fieldsToRender = isPaired ? [field, nextField] : [field];
        
        return (
          <div key={field.name} className={`grid grid-cols-1 ${isPaired ? 'md:grid-cols-2' : ''} gap-8`}>
            {fieldsToRender.filter(Boolean).map((f) => (
              <div key={f.name} className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  {f.label} {f.required && '*'}
                </label>
                <input
                  type={f.type === 'date' ? 'date' : 'text'}
                  required={f.required}
                  value={formData[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className={`${inputBaseClass} h-14`}
                  placeholder={f.placeholder || `What should I write here?`}
                />
                {f.hint && (
                  <p className="text-xs text-gray-400 ml-2 italic">{f.hint}</p>
                )}
                {!f.hint && (
                  <p className="text-xs text-gray-400 ml-2 italic">Use simple language. You can edit later.</p>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
