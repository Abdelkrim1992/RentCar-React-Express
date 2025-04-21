import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Loader2, Car, Calendar, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'accepted') {
    return (
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Accepted
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <AlertCircle className="w-3 h-3 mr-1" />
      Pending
    </div>
  );
};

interface Booking {
  id: number;
  carId: number;
  car?: {
    id: number;
    name: string;
    image: string;
    type: string;
  };
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

const MyBookings: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState(() => {
    // Try to get email from localStorage
    return localStorage.getItem('customerEmail') || '';
  });
  const [submitted, setSubmitted] = useState(!!localStorage.getItem('customerEmail'));

  const { data: bookings, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/bookings/customer', email],
    queryFn: async () => {
      if (!email) return { data: [] };
      const response = await apiRequest('GET', `/api/bookings/customer?email=${encodeURIComponent(email)}`);
      return response;
    },
    enabled: !!email && submitted,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to view your bookings.",
        variant: "destructive"
      });
      return;
    }
    
    // Save email to localStorage
    localStorage.setItem('customerEmail', email);
    setSubmitted(true);
    refetch();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Link href="/">
            <Button variant="outline">Back to Homepage</Button>
          </Link>
        </div>
        <p className="text-gray-500">View and manage your car rental bookings</p>
      </header>

      {!submitted ? (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Access Your Bookings</CardTitle>
            <CardDescription>
              Enter the email address you used when creating your booking to view your reservations.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">View My Bookings</Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <p>Showing bookings for: <span className="font-semibold">{email}</span></p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem('customerEmail');
                  setEmail('');
                  setSubmitted(false);
                }}
              >
                Change Email
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Bookings"
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center p-8 bg-red-50 rounded-lg">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Failed to load bookings</h3>
              <p className="text-gray-600 mb-4">There was an error retrieving your booking information.</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : bookings?.data?.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">We couldn't find any bookings associated with your email address.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button>Book a Car Now</Button>
                </Link>
                <Button variant="outline" onClick={() => {
                  localStorage.removeItem('customerEmail');
                  setEmail('');
                  setSubmitted(false);
                }}>
                  Try Another Email
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings?.data?.map((booking: Booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="relative">
                    {booking.car?.image ? (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img 
                          src={booking.car.image} 
                          alt={booking.car.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center bg-gray-100">
                        <Car className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle>{booking.car?.name || `Car #${booking.carId}`}</CardTitle>
                    <CardDescription>Booking #{booking.id}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Rental Period</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.pickupDate)} - {formatDate(booking.returnDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Pickup Location</p>
                          <p className="text-sm text-gray-600">{booking.pickupLocation}</p>
                        </div>
                      </div>

                      {booking.status === 'rejected' && booking.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-md">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{booking.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <div className="text-sm text-gray-500 w-full flex justify-between items-center">
                      <span>Created: {formatDate(booking.createdAt)}</span>
                      {booking.status === 'pending' && (
                        <Button variant="ghost" size="sm">Contact Us</Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;