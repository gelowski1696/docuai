import { prisma } from '@/lib/prisma';
import DocumentList from './document-list';

interface DocumentsDataProps {
  userId: string;
}

export default async function DocumentsData({ userId }: DocumentsDataProps) {
  const documents = await prisma.document.findMany({
    where: { userId },
    include: { template: true },
    orderBy: { createdAt: 'desc' },
  });

  return <DocumentList initialDocuments={documents} />;
}
