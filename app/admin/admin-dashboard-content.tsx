import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  // Fetch aggregate stats
  const [userCount, documentCount, usageStats] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.usage.aggregate({
      _sum: {
        tokensUsed: true
      }
    })
  ]);

  const totalTokens = usageStats._sum.tokensUsed || 0;
  
  // Fetch Subscription Tier Analytics
  const userTiers = await prisma.user.groupBy({
    by: ['subscriptionTier'],
    _count: { _all: true }
  });

  const tierCounts: Record<string, number> = {
    FREE: 0,
    STARTER: 0,
    PRO: 0,
    ENTERPRISE: 0
  };

  userTiers.forEach(t => {
    tierCounts[t.subscriptionTier] = t._count._all;
  });

  const PRICING = {
    FREE: 0,
    STARTER: 399,
    PRO: 899,
    ENTERPRISE: 2499
  };

  const mrr = 
    (tierCounts.STARTER * PRICING.STARTER) +
    (tierCounts.PRO * PRICING.PRO) +
    (tierCounts.ENTERPRISE * PRICING.ENTERPRISE);

  const potentialMrr = mrr + (tierCounts.FREE * PRICING.STARTER);

  // Fetch template analytics
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    select: { id: true, name: true, type: true }
  });

  const templateStats = await Promise.all(templates.map(async (t) => {
    const [count, tokens] = await Promise.all([
      prisma.document.count({ where: { templateId: t.id } }),
      prisma.usage.aggregate({
        where: { document: { templateId: t.id } },
        _sum: { tokensUsed: true }
      })
    ]);
    return {
      id: t.id,
      name: t.name,
      count,
      avgTokens: count > 0 ? Math.round((tokens._sum.tokensUsed || 0) / count) : 0,
      totalTokens: tokens._sum.tokensUsed || 0
    };
  }));

  const topTemplates = [...templateStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(...topTemplates.map(t => t.count), 1);

  // Fetch recent documents with user info
  const recentDocs = await prisma.document.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true }
      },
      template: {
        select: { name: true }
      }
    }
  });

  const stats = [
    { name: 'Total Users', value: userCount, icon: 'Users', color: 'from-indigo-500 to-blue-600' },
    { name: 'Total MRR', value: `₱${mrr.toLocaleString()}`, icon: 'CreditCard', color: 'from-emerald-500 to-teal-600' },
    { name: 'Tokens AI', value: totalTokens.toLocaleString(), icon: 'Cpu', color: 'from-amber-500 to-orange-600' },
    { name: 'Avg Efficiency', value: `${Math.round(totalTokens / (documentCount || 1))} t/doc`, icon: 'CheckCircle', color: 'from-indigo-500 to-purple-600' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          Admin <span className="gradient-text">Insights</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Real-time overview of the DocuAI ecosystem.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass rounded-3xl p-8 border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
              {stat.name === 'Total Users' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              {stat.name === 'Docs Generated' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              {stat.name === 'Tokens AI' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              {stat.name === 'Avg Efficiency' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Insights Section */}
        <div className="glass rounded-[2.5rem] p-8 border border-border/50 lg:col-span-2 overflow-hidden relative group">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4 relative">
            <div>
              <h2 className="text-2xl font-black px-2 text-emerald-600 dark:text-emerald-400">Revenue Insights</h2>
              <p className="text-sm text-gray-400 font-bold px-2 uppercase tracking-widest mt-1">Monetization & Conversion Analysis</p>
            </div>
            <div className="px-6 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₱{mrr.toLocaleString()} / mo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { label: 'Starter (₱399)', count: tierCounts.STARTER, color: 'bg-indigo-500', icon: '🚀' },
              { label: 'Pro (₱899)', count: tierCounts.PRO, color: 'bg-amber-500', icon: '✨' },
              { label: 'Enterprise (₱2,499)', count: tierCounts.ENTERPRISE, color: 'bg-purple-600', icon: '💎' },
              { label: 'Free Tier', count: tierCounts.FREE, color: 'bg-slate-400', icon: '👤' },
            ].map((tier) => (
              <div key={tier.label} className="p-6 rounded-3xl bg-white/30 dark:bg-slate-900/40 border border-border/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{tier.icon}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{tier.label}</span>
                </div>
                <div className="text-3xl font-black mb-1">{tier.count}</div>
                <div className="text-xs font-bold text-gray-400">Subscribed Users</div>
                <div className="mt-4 h-1 bg-background rounded-full overflow-hidden">
                  <div className={`h-full ${tier.color}`} style={{ width: `${(tier.count / (userCount || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Growth Potential</div>
                <div className="text-2xl font-black">₱{potentialMrr.toLocaleString()} <span className="text-sm font-medium text-gray-400">Est. MRR</span></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-500 mb-1 italic">Calculated based on 100% conversion of Free users to Starter</div>
            </div>
          </div>
        </div>

        {/* Template Performance Leaderboard */}
        <div className="glass rounded-[2.5rem] p-8 border border-border/50 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-black px-2">Template Performance</h2>
              <p className="text-sm text-gray-400 font-bold px-2 uppercase tracking-widest mt-1">Top 5 by popularity & token consumption</p>
            </div>
            <div className="flex gap-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/20 animate-pulse"></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Metadata</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {topTemplates.map((t, i) => (
                <div key={t.id} className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-400 w-4 tracking-tighter">0{i+1}</span>
                      <span className="font-bold text-lg">{t.name}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{t.count} creation{t.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="relative h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(t.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topTemplates.slice(0, 4).map((t) => (
                <div key={t.id} className="p-6 rounded-[2rem] bg-white/30 dark:bg-slate-900/40 border border-border/10 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t.name.split(' ')[0]} Efficiency</div>
                    <div className="text-2xl font-black gradient-text">{t.avgTokens.toLocaleString()}</div>
                    <div className="text-xs font-bold text-gray-400 mt-1">Avg Tokens / Doc</div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${t.avgTokens < 1000 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {t.avgTokens < 1000 ? 'OPTIMIZED' : 'STANDARD'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-[2.5rem] p-8 border border-border/50">
          <h2 className="text-2xl font-black mb-8 px-2">Recent Creations</h2>
          <div className="space-y-6">
            {recentDocs.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No documents yet.</p>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center p-4 rounded-2xl bg-white/30 dark:bg-slate-900/30 border border-border/10 hover:border-primary/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate">{doc.template.name}</div>
                    <div className="text-xs text-gray-500 font-bold truncate">{doc.user.email}</div>
                  </div>
                  <div className="text-xs font-bold text-gray-400 px-3 py-1 bg-background/50 rounded-full border border-border/50 ml-4">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health / Placeholder */}
        <div className="glass rounded-[2.5rem] p-8 border border-border/50 overflow-hidden relative">
          <h2 className="text-2xl font-black mb-8 px-2">Provider Health</h2>
          <div className="space-y-8">
             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <span className="font-bold flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> OpenAI API</span>
                 <span className="text-sm font-black text-emerald-500">OPERATIONAL</span>
               </div>
               <div className="h-1.5 bg-background rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[94%]" />
               </div>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <span className="font-bold flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Google Gemini</span>
                 <span className="text-sm font-black text-emerald-500">OPERATIONAL</span>
               </div>
               <div className="h-1.5 bg-background rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[98%]" />
               </div>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <span className="font-bold flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-3 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div> Local Ollama</span>
                 <span className="text-sm font-black text-amber-500">DEGRADED</span>
               </div>
               <div className="h-1.5 bg-background rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 w-[60%]" />
               </div>
             </div>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
