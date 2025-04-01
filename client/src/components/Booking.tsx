import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const bookingFormSchema = z.object({
  pickupLocation: z.string().min(1, { message: 'Please select a pickup location' }),
  returnLocation: z.string().min(1, { message: 'Please select a return location' }),
  pickupDate: z.string().min(1, { message: 'Please select a pickup date' }),
  returnDate: z.string().min(1, { message: 'Please select a return date' }),
  carType: z.string().min(1, { message: 'Please select a car type' }),
  name: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  phone: z.string().optional()
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const Booking: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocation: '',
      returnLocation: '',
      pickupDate: '',
      returnDate: '',
      carType: '',
      name: '',
      email: '',
      phone: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (data: BookingFormValues) => 
      apiRequest('POST', '/api/bookings', data),
    onSuccess: () => {
      toast({
        title: "Booking Submitted",
        description: "We'll confirm your reservation shortly!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: BookingFormValues) {
    mutation.mutate(data);
  }

  const locations = [
    "Downtown Office",
    "Airport Terminal",
    "Central Station",
    "Hotel Delivery/Pickup"
  ];

  const carTypes = [
    "All Cars",
    "SUVs",
    "Luxury",
    "Sports",
    "Electric"
  ];

  return (
    <section id="booking" className="py-20 bg-gray-900 text-white relative">
      <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-[#6843EC]/20 blur-[120px] z-0"></div>
      
      <div className="container mx-auto px-6">
        <div className="lg:flex items-center gap-16">
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h5 className="font-darker font-semibold text-[#D2FF3A] mb-2">QUICK BOOKING</h5>
            <h2 className="font-darker font-bold text-4xl md:text-5xl mb-6">Ready to Drive?</h2>
            <p className="text-gray-300 mb-8 max-w-xl">
              Book your dream car in just a few clicks. Fill out the form and we'll confirm your reservation instantly.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-gray-800 border-gray-700 focus:ring-[#6843EC]">
                              <SelectValue placeholder="Select pickup location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-gray-800 border-gray-700 focus:ring-[#6843EC]">
                              <SelectValue placeholder="Select return location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="w-full bg-gray-800 border-gray-700 focus:ring-[#6843EC]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="w-full bg-gray-800 border-gray-700 focus:ring-[#6843EC]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="carType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-gray-800 border-gray-700 focus:ring-[#6843EC]">
                            <SelectValue placeholder="Select car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {carTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-gradient-to-r from-[#6843EC] to-[#D2FF3A] hover:from-[#5733dc] hover:to-[#c2ef2a] text-white font-semibold"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Processing..." : "Check Availability"}
                </Button>
              </form>
            </Form>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=900&q=80" 
                className="w-full rounded-3xl shadow-lg" 
                alt="Luxury Sports Car" 
              />
              
              <div className="absolute top-6 right-6 bg-black bg-opacity-80 p-5 rounded-2xl backdrop-blur-md">
                <div className="mb-3">
                  <h4 className="font-darker font-bold text-xl">Current Special</h4>
                  <p className="text-sm text-gray-300">Limited time offer</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-[#6843EC] to-[#8F6FFF] rounded-xl mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">Use code:</p>
                    <p className="font-darker font-bold text-2xl">ETHER25</p>
                    <p className="text-xs mt-1">Expires in 3 days</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Get 25% OFF</p>
                  <p className="text-sm text-gray-300">On your first rental</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
