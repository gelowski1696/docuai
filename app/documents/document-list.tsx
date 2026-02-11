'use client';

import { useState, useEffect } from 'react';
import { deleteDocument } from '@/app/actions/delete-document';
import { getDocumentStatus } from '@/app/actions/get-document-status';
import DeleteModal from './delete-modal';
import ViewModal from './view-modal';

interface DocumentListProps {
  initialDocuments: any[];
}

export default function DocumentList({ initialDocuments }: DocumentListProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterTag, setFilterTag] = useState('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Polling logic for processing documents
  useEffect(() => {
    const processingDocs = documents.filter(d => d.status === 'PROCESSING');
    if (processingDocs.length === 0) return;

    const pollInterval = setInterval(async () => {
      const updates = await Promise.all(
        processingDocs.map(doc => getDocumentStatus(doc.id))
      );

      let hasChanged = false;
      const newDocuments = documents.map(doc => {
        const update = updates.find(u => u.success && u.document?.id === doc.id);
        if (update && update.success && update.document && update.document.status !== 'PROCESSING') {
          hasChanged = true;
          if (update.document.status === 'COMPLETED') {
            showNotification('success', `Masterpiece "${doc.template.name}" is ready!`);
          } else {
            showNotification('error', `Generation failed for "${doc.template.name}".`);
          }
          return { ...doc, ...update.document };
        }
        return doc;
      });

      if (hasChanged) {
        setDocuments(newDocuments);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [documents]);

  const handleViewClick = (doc: any) => {
    if (doc.status !== 'COMPLETED') return;
    setSelectedDoc(doc);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (doc: any) => {
    setSelectedDoc(doc);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    const result = await deleteDocument(selectedDoc.id);
    setLoading(false);

    if (result.success) {
      setDocuments(documents.filter(d => d.id !== selectedDoc.id));
      showNotification('success', 'Document deleted successfully.');
      setDeleteModalOpen(false);
    } else {
      showNotification('error', result.error || 'Failed to delete document.');
    }
  };

  const handleToggleFavorite = async (docId: string) => {
    const { toggleFavorite } = await import('@/app/actions/toggle-favorite');
    const result = await toggleFavorite(docId);
    if (result.success) {
      setDocuments(documents.map(d => d.id === docId ? { ...d, isFavorite: result.isFavorite } : d));
      showNotification('success', result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } else {
      showNotification('error', result.error || 'Failed to toggle favorite');
    }
  };

  const handleClone = async (docId: string) => {
    const { cloneDocument } = await import('@/app/actions/clone-document');
    const result = await cloneDocument(docId);
    if (result.success) {
      showNotification('success', 'Document cloning started!');
      // Refresh will happen via polling
    } else {
      showNotification('error', result.error || 'Failed to clone document');
    }
  };

  const handleSaveTags = async (docId: string, tags: string) => {
    const { updateTags } = await import('@/app/actions/update-tags');
    const result = await updateTags(docId, tags);
    if (result.success) {
      setDocuments(documents.map(d => d.id === docId ? { ...d, tags: result.tags } : d));
      setEditingTags(null);
      showNotification('success', 'Tags updated');
    } else {
      showNotification('error', result.error || 'Failed to update tags');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filterFavorites && !doc.isFavorite) return false;
    if (filterTag && (!doc.tags || !doc.tags.includes(filterTag))) return false;
    return true;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(
    documents.flatMap(d => d.tags ? d.tags.split(',').map((t: string) => t.trim()) : [])
  )).filter(Boolean);

  if (documents.length === 0) {
    return (
      <div className="glass rounded-[3rem] p-20 text-center border border-border/50 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">No documents discovered</h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
          Your library is currently empty. Start by creating a masterpiece with our AI.
        </p>
        <a
          href="/generate"
          className="inline-block px-10 py-4 bg-background border border-border/50 rounded-2xl font-black hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          Start Generating
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-[110] px-4 sm:px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400' 
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-3 sm:gap-4 items-center">
        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            filterFavorites
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-background border border-border/50 hover:border-amber-500'
          }`}
        >
          ⭐ {filterFavorites ? 'Showing Favorites' : 'Show Favorites'}
        </button>
        
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-background border border-border/50 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
        
        {(filterFavorites || filterTag) && (
          <button
            onClick={() => { setFilterFavorites(false); setFilterTag(''); }}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Clear Filters
          </button>
        )}
        
        <span className="text-sm text-gray-500 w-full sm:w-auto sm:ml-auto">
          Showing {filteredDocuments.length} of {documents.length} documents
        </span>
      </div>

      <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-border/30">
            <thead>
              <tr className="bg-background/20">
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase tracking-widest">Template Details</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Format / Status</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Created Date</th>
                <th className="px-8 py-6 text-right text-sm font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredDocuments.map((doc) => {
                const isProcessing = doc.status === 'PROCESSING';
                const isFailed = doc.status === 'FAILED';
                
                return (
                  <tr key={doc.id} className="group hover:bg-white/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                          isProcessing ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                          doc.template.type === 'INVOICE' ? 'bg-indigo-500/10 text-indigo-600' :
                          doc.template.type === 'REPORT' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-purple-500/10 text-purple-600'
                        }`}>
                          {isProcessing ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-black">{doc.template.name}</div>
                            <button
                              onClick={() => handleToggleFavorite(doc.id)}
                              className="text-xl hover:scale-125 transition-transform"
                              title={doc.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {doc.isFavorite ? '⭐' : '☆'}
                            </button>
                          </div>
                          <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                            {isProcessing ? 'Generation in Progress...' : doc.template.type}
                          </div>
                          {/* Tags */}
                          <div className="mt-2 flex flex-wrap gap-1 items-center">
                            {editingTags === doc.id ? (
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onBlur={() => handleSaveTags(doc.id, tagInput)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTags(doc.id, tagInput);
                                  if (e.key === 'Escape') setEditingTags(null);
                                }}
                                autoFocus
                                placeholder="tag1, tag2, tag3"
                                className="px-2 py-1 text-xs border border-primary rounded-lg outline-none w-40"
                              />
                            ) : (
                              <>
                                {doc.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                                  <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                <button
                                  onClick={() => { setEditingTags(doc.id); setTagInput(doc.tags || ''); }}
                                  className="px-2 py-0.5 text-xs text-gray-400 hover:text-primary transition-colors"
                                  title="Edit tags"
                                >
                                  {doc.tags ? '✏️' : '+ Add tags'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-32 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-primary animate-progress-flow origin-left" />
                          </div>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Processing</span>
                        </div>
                      ) : isFailed ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200">
                          Failed
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current transition-all duration-300 ${
                          doc.format === 'PDF' ? 'bg-red-50 text-red-600 border-red-200' :
                          doc.format === 'DOCX' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                          {doc.format}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(doc.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                      <button
                        onClick={() => handleViewClick(doc)}
                        disabled={doc.status !== 'COMPLETED'}
                        className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                          doc.status !== 'COMPLETED' 
                          ? 'opacity-20 cursor-not-allowed' 
                          : 'hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                        }`}
                        title="Quick View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <a
                        href={doc.status === 'COMPLETED' ? `/api/files/${doc.fileUrl}` : '#'}
                        download={doc.status === 'COMPLETED'}
                        className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                          doc.status !== 'COMPLETED'
                          ? 'opacity-20 cursor-not-allowed pointer-events-none'
                          : 'hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                        }`}
                        title="Download Document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4-4v12" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleClone(doc.id)}
                        disabled={isProcessing}
                        className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                          isProcessing
                          ? 'opacity-20 cursor-not-allowed'
                          : 'hover:bg-blue-500 hover:text-white hover:border-blue-500'
                        }`}
                        title="Clone Document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isProcessing}
                        className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                          isProcessing
                          ? 'opacity-20 cursor-not-allowed'
                          : 'hover:bg-red-500 hover:text-white hover:border-red-500'
                        }`}
                        title="Delete Document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-3">
          {filteredDocuments.map((doc) => {
            const isProcessing = doc.status === 'PROCESSING';
            const isFailed = doc.status === 'FAILED';

            return (
              <div key={doc.id} className="rounded-2xl border border-border/40 bg-white/40 dark:bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black">{doc.template.name}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {isProcessing ? 'Generation in Progress...' : doc.template.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(doc.id)}
                    className="text-lg"
                    title={doc.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {doc.isFavorite ? '★' : '☆'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isProcessing ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                      Processing
                    </span>
                  ) : isFailed ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200">
                      Failed
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      doc.format === 'PDF'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : doc.format === 'DOCX'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {doc.format}
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {doc.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewClick(doc)}
                    disabled={doc.status !== 'COMPLETED'}
                    className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                      doc.status !== 'COMPLETED'
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                    }`}
                    title="Quick View"
                  >
                    View
                  </button>
                  <a
                    href={doc.status === 'COMPLETED' ? `/api/files/${doc.fileUrl}` : '#'}
                    download={doc.status === 'COMPLETED'}
                    className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                      doc.status !== 'COMPLETED'
                        ? 'opacity-20 cursor-not-allowed pointer-events-none'
                        : 'hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                    }`}
                    title="Download Document"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleClone(doc.id)}
                    disabled={isProcessing}
                    className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                      isProcessing
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-blue-500 hover:text-white hover:border-blue-500'
                    }`}
                    title="Clone Document"
                  >
                    Clone
                  </button>
                  <button
                    onClick={() => handleDeleteClick(doc)}
                    disabled={isProcessing}
                    className={`inline-flex items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50 transition-all duration-300 shadow-sm ${
                      isProcessing
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-red-500 hover:text-white hover:border-red-500'
                    }`}
                    title="Delete Document"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DeleteModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        documentName={selectedDoc?.template?.name || 'this document'}
        loading={loading}
      />

      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        fileUrl={selectedDoc?.fileUrl || ''}
        documentName={selectedDoc?.template?.name || 'Document'}
        format={selectedDoc?.format || ''}
      />
    </>
  );
}
