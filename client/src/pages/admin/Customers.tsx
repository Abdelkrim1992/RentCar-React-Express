import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Search, User, Mail, Phone, Calendar, MapPin, Download } from 'lucide-react';

import Layout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Type definition for a booking
interface Booking {
  id: number;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
  carId: number | null;
  userId: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt: string | Date;
  car?: {
    id: number;
    name: string;
    type: string;
  };
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  bookings: Booking[];
  lastBookingDate: string;
  totalBookings: number;
}

const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);

  // Fetch all bookings
  const { data: bookingsData, isLoading, isError } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bookings');
      return response.data;
    }
  });

  // Process bookings to get unique customers with accepted bookings
  const processCustomers = (bookings: Booking[] = []): CustomerInfo[] => {
    // Only consider accepted bookings for customer profiles
    const acceptedBookings = bookings.filter(booking => booking.status === 'accepted');
    
    // Group by email
    const customerMap = new Map<string, Booking[]>();
    
    acceptedBookings.forEach(booking => {
      if (!booking.email) return;
      
      const existingBookings = customerMap.get(booking.email) || [];
      customerMap.set(booking.email, [...existingBookings, booking]);
    });
    
    // Convert map to array of CustomerInfo objects
    return Array.from(customerMap.entries()).map(([email, bookings]) => {
      const latestBooking = bookings.reduce((latest, current) => {
        const currentDate = new Date(current.createdAt);
        const latestDate = new Date(latest.createdAt);
        return currentDate > latestDate ? current : latest;
      }, bookings[0]);
      
      return {
        name: latestBooking.name || 'Unknown',
        email,
        phone: latestBooking.phone || 'Not provided',
        bookings,
        lastBookingDate: latestBooking.createdAt.toString(),
        totalBookings: bookings.length
      };
    });
  };

  const customers = bookingsData?.data 
    ? processCustomers(bookingsData.data)
    : [];

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.includes(query))
    );
  });

  const handleViewCustomerDetails = (customer: CustomerInfo) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Generate CSV data for export
  const generateCSV = () => {
    if (!customers.length) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Last Booking Date'];
    const csvContent = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name.replace(/"/g, '""')}"`,
        `"${customer.email.replace(/"/g, '""')}"`,
        `"${customer.phone.replace(/"/g, '""')}"`,
        customer.totalBookings,
        formatDate(customer.lastBookingDate)
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Layout>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Loading customer information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-t-[#6843EC] border-r-transparent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Could not load customer data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center">
              <p className="text-red-500">An error occurred while fetching customer data.</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customer information</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateCSV}
              className="flex items-center gap-1"
            >
              <Download size={16} /> Export CSV
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search customers..." 
                className="max-w-sm pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <Table>
              <TableCaption>
                Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Last Booking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="text-gray-400" size={16} />
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="text-gray-400" size={14} />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="text-gray-400" size={14} />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{customer.totalBookings}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="text-gray-400" size={14} />
                        <span className="text-sm">{formatDate(customer.lastBookingDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewCustomerDetails(customer)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {searchQuery 
                  ? 'No customers found matching your search.' 
                  : 'No customers with accepted bookings found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isCustomerDetailsOpen} onOpenChange={setIsCustomerDetailsOpen}>
        {selectedCustomer && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedCustomer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{selectedCustomer.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="font-medium">{selectedCustomer.phone}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Total Bookings</span>
                  <span className="font-medium">{selectedCustomer.totalBookings}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Booking History</h3>
              
              <div className="space-y-4 max-h-[400px] overflow-auto">
                {selectedCustomer.bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Booking ID</span>
                        <span className="text-sm font-medium">#{booking.id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="text-sm font-medium">{booking.status.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Car</span>
                        <span className="text-sm font-medium">{booking.car?.name || `Car #${booking.carId || 'Unknown'}`} ({booking.carType})</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Dates</span>
                        <span className="text-sm font-medium">
                          {formatDate(booking.pickupDate)} - {formatDate(booking.returnDate)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Pickup Location</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="text-gray-400" size={12} />
                          <span className="text-sm">{booking.pickupLocation}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Return Location</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="text-gray-400" size={12} />
                          <span className="text-sm">{booking.returnLocation}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Created</span>
                        <span className="text-sm">{formatDate(booking.createdAt.toString())}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => window.open(`mailto:${selectedCustomer.email}`)}
              >
                <Mail className="mr-2 h-4 w-4" /> Contact Customer
              </Button>
              <Button 
                onClick={() => setIsCustomerDetailsOpen(false)}
              >
                Close
              </Button>
            </CardFooter>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default Customers;