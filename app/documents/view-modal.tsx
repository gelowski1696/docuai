'use client';

import { useEffect, useRef, useState } from 'react';

// Use dynamic imports or require inside useEffect to avoid SSR issues
// with libraries that depend on the DOM/window

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  documentName: string;
  format: string;
}

export default function ViewModal({ isOpen, onClose, fileUrl, documentName, format }: ViewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileUrl || !containerRef.current) return;

    const renderContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/files/${fileUrl}?inline=true`);
        if (!response.ok) throw new Error('Failed to fetch file');
        
        const blob = await response.blob();
        
        if (format === 'DOCX') {
          // Dynamic import for docx-preview
          const docx = await import('docx-preview');
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            await docx.renderAsync(blob, containerRef.current);
          }
        } else if (format === 'XLSX') {
          // Dynamic import for xlsx
          const XLSX = await import('xlsx');
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(worksheet);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div className="xlsx-preview p-8">${html}</div>`;
            // Add some basic styling to the generated table
            const table = containerRef.current.querySelector('table');
            if (table) {
              table.className = 'min-w-full divide-y divide-gray-200 border border-collapse';
              table.querySelectorAll('td').forEach(td => {
                td.className = 'border px-4 py-2 text-sm text-gray-700';
              });
              table.querySelectorAll('th').forEach(th => {
                th.className = 'border px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
              });
            }
          }
        }
      } catch (err) {
        console.error('Preview error:', err);
        setError('Failed to render preview. Please download the file to view it.');
      } finally {
        setLoading(false);
      }
    };

    if (format === 'DOCX' || format === 'XLSX') {
      renderContent();
    }
  }, [isOpen, fileUrl, format]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="glass w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] border border-white/20 shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              format === 'DOCX' ? 'bg-indigo-500/10 text-indigo-600' :
              format === 'PDF' ? 'bg-red-500/10 text-red-600' :
              'bg-emerald-500/10 text-emerald-600'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black">{documentName}</h3>
              <p className="text-xs font-black text-gray-400 tracking-widest uppercase">{format} Preview</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-950 relative overflow-auto">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 z-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-gray-500">Preparing preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[2rem] flex items-center justify-center mb-8 text-red-500">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black mb-4">Preview Error</h4>
              <p className="text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                {error}
              </p>
              <a 
                href={`/api/files/${fileUrl}`} 
                download 
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              >
                Download File
              </a>
            </div>
          )}

          {format === 'PDF' ? (
            <iframe 
              src={`/api/files/${fileUrl}?inline=true#toolbar=0`} 
              className="w-full h-full border-none"
              title={documentName}
            />
          ) : (
            <div ref={containerRef} className="docx-preview-container h-full w-full bg-white text-black" />
          )}
        </div>
      </div>
    </div>
  );
}
