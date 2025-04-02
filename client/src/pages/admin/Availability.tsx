import React from 'react';
import AdminLayout from '@/components/admin/Layout';
import CarAvailabilityManager from '@/components/admin/CarAvailability';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';

const AdminAvailability: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to="/admin/login" />;
  }

  // Redirect to home if authenticated but not admin
  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <AdminLayout>
      <CarAvailabilityManager />
    </AdminLayout>
  );
};

export default AdminAvailability;