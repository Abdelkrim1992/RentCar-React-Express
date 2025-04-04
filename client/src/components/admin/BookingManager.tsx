import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { 
  Check, 
  X, 
  Clock, 
  Info, 
  Search,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

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
}

const BookingManager: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch all bookings
  const { data: bookingsData, isLoading, isError } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bookings');
      return response.data as Booking[];
    }
  });

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: number, status: string, rejectionReason?: string }) => 
      apiRequest('PATCH', `/api/bookings/${id}/status`, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Updated",
        description: "The booking status has been updated successfully.",
      });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update booking status",
        variant: "destructive"
      });
    }
  });

  // Handle accepting a booking
  const handleAccept = (booking: Booking) => {
    updateStatusMutation.mutate({ id: booking.id, status: 'accepted' });
  };

  // Handle opening the rejection dialog
  const handleOpenRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRejectDialogOpen(true);
  };

  // Handle rejecting a booking with reason
  const handleReject = () => {
    if (selectedBooking) {
      updateStatusMutation.mutate({ 
        id: selectedBooking.id, 
        status: 'rejected',
        rejectionReason
      });
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookingsData?.filter(booking => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (booking.name && booking.name.toLowerCase().includes(query)) ||
      (booking.email && booking.email.toLowerCase().includes(query)) ||
      (booking.pickupLocation.toLowerCase().includes(query)) ||
      booking.status.toLowerCase().includes(query) ||
      booking.id.toString().includes(query)
    );
  });

  // Get status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
          <Clock size={14} className="mr-1" /> Pending
        </Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <Check size={14} className="mr-1" /> Accepted
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <X size={14} className="mr-1" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
          <Info size={14} className="mr-1" /> {status}
        </Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Loading booking information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-[#6843EC] border-r-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Could not load bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-red-500">An error occurred while fetching booking data.</p>
            <Button 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/bookings'] })}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Manage customer booking requests</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Search bookings..." 
              className="max-w-sm pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings && filteredBookings.length > 0 ? (
            <Table>
              <TableCaption>
                Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{booking.name || 'N/A'}</span>
                        <span className="text-sm text-gray-500">{booking.email || 'No email'}</span>
                        {booking.phone && <span className="text-xs text-gray-400">{booking.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {booking.carType}
                        </span>
                        <span className="text-xs text-gray-500">
                          Pick-up: {booking.pickupLocation}
                        </span>
                        <span className="text-xs text-gray-500">
                          Return: {booking.returnLocation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs">
                          From: {booking.pickupDate && new Date(booking.pickupDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs">
                          To: {booking.returnDate && new Date(booking.returnDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created: {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={booking.status} />
                        {booking.status === 'rejected' && booking.rejectionReason && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-gray-500 max-w-[200px] truncate cursor-help">
                                  Reason: {booking.rejectionReason}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{booking.rejectionReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            onClick={() => handleAccept(booking)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check size={16} className="mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            onClick={() => handleOpenRejectDialog(booking)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X size={16} className="mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown size={14} className="ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Booking Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.open(`mailto:${booking.email}`)}>
                              Contact Customer
                            </DropdownMenuItem>
                            {booking.status !== 'pending' && (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'pending' })}>
                                Reset to Pending
                              </DropdownMenuItem>
                            )}
                            {booking.status !== 'accepted' && (
                              <DropdownMenuItem onClick={() => handleAccept(booking)}>
                                Mark as Accepted
                              </DropdownMenuItem>
                            )}
                            {booking.status !== 'rejected' && (
                              <DropdownMenuItem onClick={() => handleOpenRejectDialog(booking)}>
                                Mark as Rejected
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {searchQuery ? 'No bookings found matching your search.' : 'No bookings available.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. This information will help the customer understand why their booking was rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="E.g., 'Car unavailable for the requested dates' or 'Requested vehicle type is out of service'"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Processing..." : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingManager;