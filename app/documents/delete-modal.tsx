'use client';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentName: string;
  loading: boolean;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, documentName, loading }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="glass max-w-md w-full rounded-[2.5rem] p-10 border border-white/20 shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-3xl font-black text-center mb-4">Are you sure?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10 leading-relaxed font-medium">
          You are about to delete <span className="text-gray-900 dark:text-white font-black">"{documentName}"</span>. This action cannot be undone.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/25 hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 bg-background border border-border/50 rounded-2xl font-black text-lg hover:border-primary/50 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
