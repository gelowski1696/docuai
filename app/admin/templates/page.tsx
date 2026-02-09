import { prisma } from '@/lib/prisma';
import TemplateItem from '@/app/admin/templates/template-item';

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-4">
            Template <span className="gradient-text">Engine</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Manage the blueprints that drive your AI document generation.</p>
        </div>
        <button className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
          + New Template
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((template) => (
          <TemplateItem key={template.id} template={JSON.parse(JSON.stringify(template))} />
        ))}
      </div>
    </div>
  );
}
