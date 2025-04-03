import React from 'react';
import AdminLayout from '@/components/admin/Layout';
import CarManager from '@/components/admin/CarManager';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';

const AdminCars: React.FC = () => {
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
      <CarManager />
    </AdminLayout>
  );
};

export default AdminCars;