import React from 'react';
import Layout from '@/components/admin/Layout';
import BookingManager from '@/components/admin/BookingManager';

const AdminBookings: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <p className="text-gray-500">
            Review and manage customer booking requests
          </p>
        </header>

        <div className="space-y-6">
          <BookingManager />
        </div>
      </div>
    </Layout>
  );
};

export default AdminBookings;