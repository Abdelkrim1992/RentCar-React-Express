import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Search, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

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

interface CarType {
  id: number;
  type: string;
}

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
  carType: z.string({
    required_error: "Car type is required",
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
  const [showResult, setShowResult] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [carId, setCarId] = useState<number | null>(null);

  // Fetch car types from API
  const { data: carsResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ['/api/cars'],
  });

  // Get unique car types
  const carTypes = carsResponse?.data
    ? Array.from(new Set(carsResponse.data.map(car => car.type)))
    : [];

  // Initialize form
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      carType: '',
    },
  });

  // Simulated availability check (in a real app, this would check against actual bookings)
  function checkAvailability(data: AvailabilityFormValues) {
    setShowResult(true);
    
    // For demo purposes: 80% chance of available cars
    const randomAvailable = Math.random() > 0.2;
    setIsAvailable(randomAvailable);

    if (randomAvailable && carsResponse?.data) {
      // Find a car of the selected type
      const matchingCars = carsResponse.data.filter(car => car.type === data.carType);
      if (matchingCars.length > 0) {
        // Select the first matching car
        setCarId(matchingCars[0].id);
      }
    }
  }

  // Handle booking button click
  const handleBookNow = () => {
    if (carId) {
      navigate(`/booking/${carId}`);
    }
  };

  return (
    <section id="availability-checker" className="bg-white">
      <div className="container mx-auto px-6 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10"
        >
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
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
                      
                      {/* Car Type */}
                      <FormField
                        control={form.control}
                        name="carType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Car Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a car type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                  carTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                
                {/* Availability Results */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 pt-6 border-t"
                  >
                    {isAvailable ? (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                          <Car className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Vehicles Available!</h3>
                        <p className="text-gray-600 mb-6">Great news! We have vehicles matching your criteria available for your selected dates.</p>
                        <Button 
                          onClick={handleBookNow}
                          className="bg-black hover:bg-black/90 text-white"
                        >
                          Book Now
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Vehicles Available</h3>
                        <p className="text-gray-600 mb-6">We're sorry, but there are no vehicles available for your selected dates. Please try different dates or car type.</p>
                        <Button 
                          variant="outline"
                          onClick={() => setShowResult(false)}
                          className="border-black text-black hover:bg-black hover:text-white"
                        >
                          Try Different Dates
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AvailabilityChecker;