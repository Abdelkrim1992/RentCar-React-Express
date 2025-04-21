import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Car, CreditCard, Settings, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/Layout';
import { useReduxPersist, useReduxData, useIsFreshData } from '@/hooks/use-redux-persistence';

interface ApiResponse<T> {
  success: boolean;
  data: T[];
}

const AdminDashboard: React.FC = () => {
  // Check if we have fresh data in Redux
  const isFreshBookingsData = useIsFreshData('/api/bookings', 5 * 60 * 1000); // 5 minutes freshness
  const isFreshCarsData = useIsFreshData('/api/cars', 5 * 60 * 1000);
  const reduxBookingsData = useReduxData('/api/bookings');
  const reduxCarsData = useReduxData('/api/cars');
  
  // Fetch data for the dashboard
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<ApiResponse<any>>({
    queryKey: ['/api/bookings'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    refetchInterval: 30000, // Poll for new bookings every 30 seconds
    refetchOnWindowFocus: true,
    initialData: isFreshBookingsData ? { success: true, data: reduxBookingsData } : undefined
  });

  const { data: carsData, isLoading: carsLoading, refetch: refetchCars } = useQuery<ApiResponse<any>>({
    queryKey: ['/api/cars'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    initialData: isFreshCarsData ? { success: true, data: reduxCarsData } : undefined
  });

  const bookings = bookingsData?.data || [];
  const cars = carsData?.data || [];
  
  // Persist data to Redux store for cross-page access
  useReduxPersist('/api/bookings', bookings);
  useReduxPersist('/api/cars', cars);

  // Calculate some stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
  const confirmedBookings = bookings.filter(booking => booking.status === 'accepted').length;
  const totalCars = cars.length;
  const totalRevenue = bookings.reduce((acc, booking) => {
    // Find the car for this booking
    const car = cars.find(c => c.id === booking.carId);
    if (car && booking.status !== 'cancelled') {
      // Calculate days between pickup and return
      const pickupDate = new Date(booking.pickupDate);
      const returnDate = new Date(booking.returnDate);
      const days = Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)));
      return acc + (parseFloat(car.price) * days);
    }
    return acc;
  }, 0);

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                refetchBookings();
                refetchCars();
              }}
              title="Refresh dashboard data"
              className="ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/admin/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    +20% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingBookings} pending, {confirmedBookings} accepted
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cars</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCars}</div>
                  <p className="text-xs text-muted-foreground">
                    {cars.filter(car => car.type === 'Premium').length} premium cars
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last week
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      {totalBookings} bookings this month
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      refetchBookings();
                      refetchCars();
                    }}
                    title="Refresh all data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                  </Button>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{booking.name || 'Guest User'}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={booking.status === 'accepted' ? 'default' : booking.status === 'pending' ? 'outline' : 'destructive'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/admin/bookings">
                    <Button variant="outline" className="w-full">View All</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Popular Cars</CardTitle>
                  <CardDescription>
                    Top booked vehicles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {carsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
                    </div>
                  ) : cars.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No cars found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cars.slice(0, 4).map((car) => (
                        <div key={car.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden mr-3">
                              {car.image && (
                                <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{car.name}</div>
                              <div className="text-sm text-muted-foreground">${car.price}/day</div>
                            </div>
                          </div>
                          <Badge variant="outline">{car.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/admin/cars">
                    <Button variant="outline" className="w-full">Manage Cars</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Analytics Coming Soon</CardTitle>
                <CardDescription>
                  Detailed analytics about bookings, revenue, and popular cars will be available in future updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="mx-auto h-12 w-12 mb-2" />
                  <p>Analytics dashboard under development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Reports Coming Soon</CardTitle>
                <CardDescription>
                  Generate and export detailed reports about your rental business.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 mb-2" />
                  <p>Reports feature under development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;