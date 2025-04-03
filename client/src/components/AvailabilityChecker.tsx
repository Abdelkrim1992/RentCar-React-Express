import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Search, Car, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Import car type from CarsShowcase
import { CarType } from '@/components/CarsShowcase';

interface ApiResponse {
  success: boolean;
  data: CarType[];
}

// Define form validation schema
const availabilityFormSchema = z.object({
  pickupDate: z.date({
    required_error: "Pickup date is required",
  }),
  returnDate: z.date({
    required_error: "Return date is required",
  }),
}).refine(data => {
  return data.returnDate > data.pickupDate;
}, {
  message: "Return date must be after pickup date",
  path: ["returnDate"],
});

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

const AvailabilityChecker: React.FC = () => {
  const [, navigate] = useLocation();
  const [searched, setSearched] = useState(false);
  // Removed car type filtering as per requirements
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch all cars from API
  const { data: carsResponse, isLoading: isCarsLoading } = useQuery<ApiResponse>({
    queryKey: ['/api/cars'],
  });

  // Get unique car types
  const carTypes = carsResponse?.data
    ? Array.from(new Set(carsResponse.data.map(car => car.type)))
    : [];

  // State to hold filtered cars
  const [filteredCars, setFilteredCars] = useState<CarType[]>([]);

  // Listen for currency change events
  React.useEffect(() => {
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

  // Initialize form
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  });

  // Calculate number of days between pickup and return dates
  const daysBetween = (date1: Date | undefined, date2: Date | undefined) => {
    // If either date is undefined, return 1 day as default
    if (!date1 || !date2) return 1;
    
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to check availability using the server API
  function checkAvailability(data: AvailabilityFormValues) {
    setSearched(true);
    setIsLoading(true);
    setError(null);
    
    console.log('Checking availability with:', data);
    
    // Query server for available cars
    fetch(`/api/cars/available?startDate=${data.pickupDate.toISOString()}&endDate=${data.returnDate.toISOString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        setIsLoading(false);
        if (result.success) {
          console.log('Available cars:', result.data);
          setFilteredCars(result.data || []);
          
          if (result.data && result.data.length === 0) {
            setError(`No cars available for the selected dates. Please try different dates.`);
          } else {
            setError(null);
          }
        } else {
          setFilteredCars([]);
          setError(result.message || 'Could not fetch available cars');
          console.error('Error fetching available cars:', result.error);
        }
      })
      .catch(error => {
        setIsLoading(false);
        setFilteredCars([]);
        setError('Error connecting to server. Please try again.');
        console.error('Error checking availability:', error);
      });
  }

  return (
    <section id="availability-checker" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Ride</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select your dates to see our available vehicles for your trip
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-10">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#6843EC]/90 to-[#D2FF3A]/90 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Check Availability</h2>
                <p className="opacity-80">Find available cars for your trip dates</p>
              </div>
              
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(checkAvailability)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      
                      {/* Empty space for third grid column on large screens */}
                      <div className="hidden md:block"></div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-[#6843EC] hover:bg-[#6843EC]/90 text-white px-8 py-6"
                        disabled={isLoading}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Check Availability
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
          
          {/* Display available cars */}
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  {filteredCars.length > 0 
                    ? `Available Cars (${filteredCars.length})` 
                    : `No Cars Available`}
                </h3>
                <p className="text-gray-600">
                  {filteredCars.length > 0 
                    ? `Book your car for ${daysBetween(form.watch('pickupDate'), form.watch('returnDate'))} days`
                    : "Please try different dates"}
                </p>
              </div>
              
              {isLoading ? (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Checking Availability</h3>
                  <p className="text-gray-600 mb-6">We're searching for available cars for your selected dates...</p>
                </div>
              ) : error ? (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Availability Check Error</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setError(null);
                      form.handleSubmit(checkAvailability)();
                    }}
                    className="border-black text-black hover:bg-black hover:text-white mr-2"
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Reset Form
                  </Button>
                </div>
              ) : filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCars.map((car) => {
                    // Calculate rental price for the selected period
                    const days = daysBetween(form.watch('pickupDate'), form.watch('returnDate'));
                    const totalPrice = parseFloat(car.price) * days;
                    
                    return (
                      <motion.div 
                        key={car.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * (car.id % 5) }}
                        className="group"
                      >
                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow">
                          <div className="relative">
                            <img 
                              src={car.image || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&h=300&q=80"} 
                              alt={car.name}
                              className="w-full h-48 object-cover"
                            />
                            {car.special && (
                              <Badge 
                                className={`absolute top-4 left-4 px-2 py-1 text-xs ${car.specialColor || 'bg-red-500'}`}
                              >
                                {car.special}
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{car.name}</h3>
                                <p className="text-sm text-gray-500">{car.type}</p>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{car.rating}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-lg bg-gray-100 mr-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <span className="text-sm">{car.power}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-lg bg-gray-100 mr-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm">{car.seats} Seats</span>
                              </div>
                            </div>
                            
                            <div className="flex items-baseline justify-between pt-3 border-t">
                              <div>
                                <p className="text-sm text-gray-500">Total for {days} days</p>
                                <p className="text-xl font-bold">{formatPrice(totalPrice, currency)}</p>
                              </div>
                              <Button 
                                onClick={() => navigate(`/booking/${car.id}`)}
                                className="bg-black hover:bg-black/90 text-white"
                                size="sm"
                              >
                                Book Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Vehicles Available</h3>
                  <p className="text-gray-600 mb-6">We couldn't find any cars available for your selected dates.</p>
                  <Button 
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Try Different Options
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AvailabilityChecker;