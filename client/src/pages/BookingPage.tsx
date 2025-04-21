import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { formatPrice } from '@/components/CurrencySelector';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CarType } from '@/components/CarsShowcase';

// Response type definition from API
interface CarResponse {
  success: boolean;
  data: CarType;
}

// Define the booking form validation schema
const bookingFormSchema = z.object({
  pickupLocation: z.string().min(2, {
    message: "Pickup location must be at least 2 characters.",
  }),
  returnLocation: z.string().min(2, {
    message: "Return location must be at least 2 characters.",
  }),
  pickupDate: z.date({
    required_error: "Please select a pickup date.",
  }),
  returnDate: z.date({
    required_error: "Please select a return date.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(6, {
    message: "Phone number must be at least 6 characters.",
  }),
  comments: z.string().optional(),
}).refine(data => {
  return data.returnDate > data.pickupDate;
}, {
  message: "Return date must be after pickup date",
  path: ["returnDate"],
});

// Type for our form data
type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingPage: React.FC = () => {
  const params = useParams();
  const carId = params.carId;
  const [, navigate] = useLocation();
  const [currency, setCurrency] = useState('USD');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Listen for currency change events
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail.currency);
    };
    
    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    
    // Check for saved currency in localStorage on initial load
    const savedCurrency = localStorage.getItem('ether_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Booking - Car ID from params:", carId);
  }, [carId]);

  // Fetch car details from API
  const { data: carResponse, isLoading: isLoadingCar } = useQuery<CarResponse>({
    queryKey: [`/api/cars/${carId}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!carId,
  });

  const car = carResponse?.data;

  // Define form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocation: "",
      returnLocation: "",
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      name: "",
      email: "",
      phone: "",
      comments: "",
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingFormValues) => 
      apiRequest('POST', '/api/bookings', {
        ...data,
        // Convert dates to ISO strings
        pickupDate: data.pickupDate.toISOString(),
        returnDate: data.returnDate.toISOString(),
        carId: parseInt(carId as string),
        carType: car?.type || 'Unknown',
        status: 'pending'
      }),
    onSuccess: (response) => {
      // Set the booking ID from the response
      if (response.data && response.data.id) {
        setBookingId(response.data.id);
      }
      // Show success dialog
      setShowSuccessDialog(true);
      // Invalidate bookings query cache
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
  });

  // Form submission handler
  function onSubmit(data: BookingFormValues) {
    createBookingMutation.mutate(data);
  }

  if (isLoadingCar) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
          <p className="text-gray-500 mb-6">The car you're trying to book could not be found.</p>
          <Button asChild>
            <Link href="/#cars">Browse Cars</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate number of days between pickup and return dates
  const daysBetween = (date1: Date, date2: Date) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const rentalDays = daysBetween(form.watch('pickupDate'), form.watch('returnDate'));
  const totalPrice = parseFloat(car.price) * rentalDays;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(`/cars/${carId}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Car Details
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-darker font-bold text-3xl md:text-4xl mb-2">Book Your {car.name}</h1>
            <p className="text-gray-600 mb-8">Complete the form below to reserve this vehicle for your trip.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form Section */}
              <div className="lg:col-span-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pickup Location */}
                      <FormField
                        control={form.control}
                        name="pickupLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Airport Terminal 2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Return Location */}
                      <FormField
                        control={form.control}
                        name="returnLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Downtown Office" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Pickup Date */}
                      <FormField
                        control={form.control}
                        name="pickupDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Pickup Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || 
                                    date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Return Date */}
                      <FormField
                        control={form.control}
                        name="returnDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Return Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <= form.watch('pickupDate') || 
                                    date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="e.g. john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. +1 234 567 8900" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Additional Comments */}
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Requirements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or requirements?" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 bg-black text-white hover:bg-black/90 font-semibold"
                      disabled={createBookingMutation.isPending}
                    >
                      {createBookingMutation.isPending ? "Processing..." : "Complete Booking"}
                    </Button>
                  </form>
                </Form>
              </div>
              
              {/* Booking Summary Section */}
              <div>
                <Card className="sticky top-28 shadow-lg">
                  <CardHeader className="bg-gray-50 rounded-t-xl">
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>
                      {car.name} - {car.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Daily Rate</span>
                        <span className="font-semibold">{formatPrice(car.price, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rental Duration</span>
                        <span className="font-semibold">{rentalDays} days</span>
                      </div>
                      <div className="border-t pt-4 flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span className="text-xl text-[#6843EC]">{formatPrice(totalPrice.toString(), currency)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                          <span>Free cancellation up to 24 hours before pickup</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                          <span>Insurance included in the price</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                          <span>24/7 customer support during your rental</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Booking Successful!
            </DialogTitle>
            <DialogDescription>
              Your reservation has been submitted and is now pending confirmation.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Booking Reference: <span className="font-semibold">#{bookingId}</span></p>
            <p className="text-sm text-gray-600">We've sent a confirmation email with all details to your email address.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 flex flex-col sm:flex-row items-stretch">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Return to Homepage
            </Button>
            <Button 
              onClick={() => {
                // Store email in localStorage for easy access to bookings later
                const email = form.getValues("email");
                if (email) {
                  localStorage.setItem('customerEmail', email);
                }
                // Navigate to my bookings page
                navigate("/my-bookings");
              }}
            >
              View All My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;