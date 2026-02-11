import { prisma } from '@/lib/prisma';
import TierEditor from '@/app/admin/users/role-toggle';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          User <span className="gradient-text">Management</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Control access and monitor activity across all accounts.</p>
      </header>

      <div className="glass rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/30">
            <thead>
              <tr className="bg-background/20">
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Tier</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Docs</th>
                <th className="px-8 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-right text-sm font-bold text-gray-400 uppercase tracking-widest">Tier Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/30 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4 font-black">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="font-black text-lg">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${
                      user.subscriptionTier === 'PRO'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        : user.subscriptionTier === 'ENTERPRISE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : user.subscriptionTier === 'STARTER'
                        ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
                        : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                    }`}>
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-center font-black text-gray-400">
                    {user._count.documents}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-center text-gray-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <TierEditor userId={user.id} currentTier={user.subscriptionTier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
