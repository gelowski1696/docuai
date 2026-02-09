import { Suspense } from 'react';
import AdminDashboardContent from '../admin-dashboard-content';
import AdminDashboardSkeleton from '../admin-dashboard-skeleton';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
