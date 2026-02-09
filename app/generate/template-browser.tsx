'use client';

import { useState, useMemo } from 'react';
import { isTemplateLocked, getTemplateTier, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { SubscriptionTier } from '@/lib/subscription';

interface TemplateBrowserProps {
  templates: any[];
  subscription: any;
  onSelect: (templateId: string) => void;
}

const TEMPLATES_PER_PAGE = 24;

const TEMPLATE_ICONS: Record<string, string> = {
  'INVOICE': '📄', 'REPORT': '📊', 'MEMO': '✉️', 'CONTENT': '🖋️',
  'PRESENTATION': '📽️', 'RESUME': '👤', 'LEGAL_CONTRACT': '⚖️', 'NEWSLETTER': '📰',
  'MEETING_MINUTES': '⏰', 'PROJECT_PROPOSAL': '📝', 'PRODUCT_SPEC': '💻', 'PRESS_RELEASE': '📢',
  'CASE_STUDY': '🎯', 'JOB_DESCRIPTION': '💼', 'COVER_LETTER': '📨', 'SOCIAL_MEDIA_PLAN': '📱',
  'SOP': '📋', 'MEETING_AGENDA': '📅', 'THANK_YOU_NOTE': '💌', 'EXPENSE_REPORT': '💰',
  'DAILY_STANDUP': '🌅', 'FEEDBACK_FORM': '💬', 'EVENT_INVITATION': '🎉',
  'ONBOARDING_CHECKLIST': '✅', 'PERFORMANCE_REVIEW': '⭐', 'TRAINING_MANUAL': '📚',
  'INCIDENT_REPORT': '⚠️', 'QUARTERLY_GOALS': '🎯', 'WHITE_PAPER': '📑', 'RFP_RESPONSE': '📤',
  'EXECUTIVE_SUMMARY': '📌', 'BUSINESS_PLAN': '🏢', 'SWOT_ANALYSIS': '🔍',
  'ANNUAL_REPORT': '📈', 'BOARD_PRESENTATION': '🎤', 'COMPLIANCE_AUDIT': '🛡️',
  'MERGER_PROPOSAL': '🤝', 'INVESTOR_PITCH': '💎'
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  'FREE': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  'STARTER': 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
  'PRO': 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  'ENTERPRISE': 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
};

export default function TemplateBrowser({ templates, subscription, onSelect }: TemplateBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<SubscriptionTier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter templates based on search, category, and tier
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search filter
      const matchesSearch = search.trim() === '' || 
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.type.toLowerCase().includes(search.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || 
        TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.templateTypes.includes(template.type);
      
      // Tier filter
      const templateTier = getTemplateTier(template.type);
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(templateTier);

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [templates, search, selectedCategory, selectedTiers]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * TEMPLATES_PER_PAGE,
    currentPage * TEMPLATES_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const toggleTier = (tier: SubscriptionTier) => {
    setSelectedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
    setCurrentPage(1);
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-24 space-y-6">
          {/* Categories */}
          <div className="bg-white/50 dark:bg-gray-900/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  !selectedCategory 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>📁</span>
                <span>All Templates</span>
                <span className="ml-auto text-xs opacity-70">{templates.length}</span>
              </button>
              {TEMPLATE_CATEGORIES.map(cat => {
                const count = templates.filter(t => cat.templateTypes.includes(t.type)).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-auto text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier Filter */}
          <div className="bg-white/50 dark:bg-gray-900/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Subscription Tier</h3>
            <div className="space-y-2">
              {(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as SubscriptionTier[]).map(tier => (
                <label key={tier} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTiers.includes(tier)}
                    onChange={() => toggleTier(tier)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${TIER_COLORS[tier]}`}>
                    {tier}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-900 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-border/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <span>
            Showing <strong>{paginatedTemplates.length}</strong> of <strong>{filteredTemplates.length}</strong> templates
          </span>
          {selectedCategory && (
            <button 
              onClick={() => handleCategoryChange(null)}
              className="text-primary hover:underline flex items-center gap-1"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {/* Template Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedTemplates.map(template => {
              const isLocked = isTemplateLocked(subscription?.tier || 'FREE', template.type);
              const tier = getTemplateTier(template.type);
              
              return (
                <button
                  key={template.id}
                  disabled={isLocked}
                  onClick={() => onSelect(template.id)}
                  className={`group relative flex flex-col items-center p-5 bg-white/60 dark:bg-gray-900/60 border border-border/50 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:border-primary/50 backdrop-blur-sm ${
                    isLocked ? 'opacity-50 cursor-not-allowed grayscale-[0.3]' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {/* Tier Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${TIER_COLORS[tier]}`}>
                    {tier}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    {TEMPLATE_ICONS[template.type] || '📄'}
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-tight mb-1 line-clamp-2">
                    {template.name}
                  </h3>

                  {/* Type */}
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {template.type.replace(/_/g, ' ')}
                  </span>

                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-2xl">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/50 px-3 py-1 rounded-full">
                        🔒 Upgrade
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {paginatedTemplates.map(template => {
              const isLocked = isTemplateLocked(subscription?.tier || 'FREE', template.type);
              const tier = getTemplateTier(template.type);
              
              return (
                <button
                  key={template.id}
                  disabled={isLocked}
                  onClick={() => onSelect(template.id)}
                  className={`w-full flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-900/60 border border-border/50 rounded-xl text-left transition-all hover:shadow-md hover:border-primary/50 backdrop-blur-sm ${
                    isLocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {TEMPLATE_ICONS[template.type] || '📄'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate">{template.name}</h3>
                    <span className="text-xs text-gray-400">{template.type.replace(/_/g, ' ')}</span>
                  </div>

                  {/* Tier Badge */}
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${TIER_COLORS[tier]}`}>
                    {tier}
                  </div>

                  {/* Lock/Arrow */}
                  {isLocked ? (
                    <span className="text-amber-500">🔒</span>
                  ) : (
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">No templates found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border/50 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'border border-border/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border/50 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
