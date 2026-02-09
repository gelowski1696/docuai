'use client';

import { useState, useEffect } from 'react';
import { suggestTemplates, TemplateSuggestion } from '@/app/actions/suggest-templates';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartSuggestionsProps {
  onSelect: (templateId: string) => void;
}

export default function SmartSuggestions({ onSelect }: SmartSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const result = await suggestTemplates(debouncedQuery);
        if (result.success && result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  return (
    <div className="w-full space-y-4">
      <div className="relative group">
        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">
          AI Smart Suggestion
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type what you want to create (e.g., 'Project report for Q1')"
            className="w-full h-14 pl-14 pr-6 bg-white dark:bg-gray-900 border border-border/50 dark:border-white/10 rounded-[1.25rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-lg shadow-sm"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
            {loading ? (
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {suggestions.map((s, idx) => (
              <button
                key={`${s.templateId}-${idx}`}
                onClick={() => onSelect(s.templateId)}
                className="glass p-4 text-left border border-primary/20 hover:border-primary hover:bg-primary/5 rounded-2xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                    {s.confidence}% Match
                  </span>
                </div>
                <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  {s.templateName}
                </div>
                <div className="text-[10px] text-gray-500 line-clamp-2 mt-1 italic">
                  "{s.reason}"
                </div>
                <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
