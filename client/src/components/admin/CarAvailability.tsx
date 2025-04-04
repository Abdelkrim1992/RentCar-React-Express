import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { Calendar as CalendarIcon, Car, Plus, Edit, Trash2, Check, X } from 'lucide-react';

// Define API response interface
interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Form schema for car availability
const carAvailabilityFormSchema = z.object({
  carId: z.coerce.number().min(1, 'Please select a car'),
  startDate: z.date({ required_error: 'Please select a start date' }),
  endDate: z.date({ required_error: 'Please select an end date' }),
  isAvailable: z.boolean().default(true),
  carType: z.string().optional(),
  city: z.string().optional(),
});

type CarAvailabilityFormValues = z.infer<typeof carAvailabilityFormSchema>;

interface Car {
  id: number;
  name: string;
  type: string;
}

interface CarAvailability {
  id: number;
  carId: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  carType?: string;
  city: string;
  createdAt: string;
  car?: {
    id: number;
    name: string;
    type: string;
  };
}

const CarAvailabilityManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<CarAvailability | null>(null);

  // Get all cars
  const { data: carsResponse } = useQuery<ApiResponse>({
    queryKey: ['/api/cars'],
  });
  
  // Extract cars from response and ensure it's an array
  const cars = Array.isArray(carsResponse?.data) ? carsResponse?.data : [];

  // Get all car availabilities from our new endpoint to avoid route conflicts
  const { data: availabilitiesResponse, isLoading, isError: availabilitiesError } = useQuery<ApiResponse>({
    queryKey: ['/api/car-availabilities'],
    retry: (failureCount, error: any) => {
      // Retry network errors but not server errors
      return failureCount < 2 && error?.status !== 500;
    }
  });
  
  // Extract availabilities from response and ensure it's an array
  const availabilities = Array.isArray(availabilitiesResponse?.data) ? availabilitiesResponse?.data : [];
  
  // Debug log to see what data we're getting from the API
  React.useEffect(() => {
    if (availabilitiesResponse?.data) {
      console.log('Car availabilities from API:', availabilitiesResponse.data);
      // Check if city values are present
      if (Array.isArray(availabilitiesResponse.data)) {
        availabilitiesResponse.data.forEach((avail: any, index: number) => {
          console.log(`Availability #${index + 1}:`, {
            id: avail.id,
            carId: avail.carId,
            city: avail.city,
            cityType: typeof avail.city,
            hasCity: 'city' in avail,
            cityValue: String(avail.city)
          });
        });
      }
    }
  }, [availabilitiesResponse?.data]);

  // Form for adding new car availability
  const form = useForm<CarAvailabilityFormValues>({
    resolver: zodResolver(carAvailabilityFormSchema),
    defaultValues: {
      carId: 0,
      isAvailable: true,
    },
  });

  // Form for editing car availability
  const editForm = useForm<CarAvailabilityFormValues>({
    resolver: zodResolver(carAvailabilityFormSchema),
    defaultValues: {
      carId: 0,
      isAvailable: true,
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: CarAvailabilityFormValues) => {
      // Find the selected car to get its type
      const selectedCar = cars.find((car: Car) => car.id === data.carId);
      
      // Log the data being sent to the API
      console.log('Adding car availability with data:', {
        ...data,
        carType: selectedCar?.type,
        city: data.city || ''
      });
      
      // Include the car type in the data sent to the API
      return apiRequest('POST', '/api/cars/availability', {
        ...data,
        carType: selectedCar?.type,
        city: data.city || ''  // Remove optional chaining and ensure city is included
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car availability added successfully',
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/car-availabilities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add car availability',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CarAvailabilityFormValues & { id: number }) => {
      // Find the selected car to get its type
      const selectedCar = cars.find((car: Car) => car.id === data.carId);
      
      // Log the data being sent to the API
      console.log('Updating car availability with data:', {
        id: data.id,
        carId: data.carId,
        startDate: data.startDate,
        endDate: data.endDate,
        isAvailable: data.isAvailable,
        carType: selectedCar?.type,
        city: data.city || ''
      });
      
      return apiRequest(
        'PATCH', 
        `/api/cars/availability/${data.id}`, 
        {
          carId: data.carId,
          startDate: data.startDate,
          endDate: data.endDate,
          isAvailable: data.isAvailable,
          carType: selectedCar?.type,
          city: data.city || '',
        }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car availability updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedAvailability(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/car-availabilities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update car availability',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/cars/availability/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car availability deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/car-availabilities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete car availability',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle form submission
  function onSubmit(data: CarAvailabilityFormValues) {
    // Validate date range
    if (data.endDate < data.startDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date cannot be before start date',
      });
      return;
    }

    addMutation.mutate(data);
  }

  // Handle edit form submission
  function onEditSubmit(data: CarAvailabilityFormValues) {
    // Validate date range
    if (data.endDate < data.startDate) {
      editForm.setError('endDate', {
        type: 'manual',
        message: 'End date cannot be before start date',
      });
      return;
    }

    if (selectedAvailability) {
      updateMutation.mutate({
        ...data,
        id: selectedAvailability.id,
      });
    }
  }

  // Handle edit click
  const handleEdit = (availability: CarAvailability) => {
    setSelectedAvailability(availability);
    
    // Parse dates from string to Date
    const startDate = new Date(availability.startDate);
    const endDate = new Date(availability.endDate);
    
    editForm.reset({
      carId: availability.carId,
      startDate,
      endDate,
      isAvailable: availability.isAvailable,
      city: availability.city || '',
    });
    
    setIsEditDialogOpen(true);
  };

  // Handle delete click
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this availability?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Availability Management</h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Availability
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Car Availability</DialogTitle>
              <DialogDescription>
                Set the availability of a car for a specific date range.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="carId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a car" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cars.map((car: Car) => (
                            <SelectItem key={car.id} value={car.id.toString()}>
                              {car.name} ({car.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rabat">Rabat</SelectItem>
                          <SelectItem value="Casablanca">Casablanca</SelectItem>
                          <SelectItem value="Agadir">Agadir</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the city where the car will be available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Available</FormLabel>
                        <FormDescription>
                          Mark the car as available or unavailable during this period
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Car Availability Schedule</CardTitle>
          <CardDescription>
            Manage the availability of cars for specific date ranges. This affects which cars are shown
            when customers search for available cars.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading car availabilities...</p>
          ) : availabilitiesError ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">There was an error loading car availabilities. The database table might need to be set up.</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/car-availabilities'] })}
              >
                Try Again
              </Button>
            </div>
          ) : availabilities.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No car availabilities found. Add some using the button above.</p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of all car availability entries</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilities.map((availability: CarAvailability) => (
                  <TableRow key={availability.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Car size={16} className="mr-2" />
                        {availability.car?.name || `Car ID: ${availability.carId}`}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(availability.startDate), 'PP')}</TableCell>
                    <TableCell>{format(new Date(availability.endDate), 'PP')}</TableCell>
                    <TableCell>
                      {(() => {
                        // Debug in a self-invoking function to prevent React rendering issues
                        console.log(`Rendering city for availability ${availability.id}:`, {
                          city: availability.city,
                          cityType: typeof availability.city,
                          cityLength: availability.city?.length,
                          cityEmpty: availability.city === "",
                          cityNull: availability.city === null,
                          cityUndefined: availability.city === undefined
                        });
                        
                        // Return the city or "Not specified" if it's empty/null/undefined
                        if (availability.city && availability.city.trim() !== '') {
                          return availability.city;
                        } else {
                          return 'Not specified';
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        availability.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {availability.isAvailable ? (
                          <>
                            <Check size={12} className="mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <X size={12} className="mr-1" />
                            Unavailable
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(availability)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(availability.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car Availability</DialogTitle>
            <DialogDescription>
              Update the availability of a car for a specific date range.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="carId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a car" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cars.map((car: Car) => (
                          <SelectItem key={car.id} value={car.id.toString()}>
                            {car.name} ({car.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rabat">Rabat</SelectItem>
                        <SelectItem value="Casablanca">Casablanca</SelectItem>
                        <SelectItem value="Agadir">Agadir</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the city where the car will be available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>
                        Mark the car as available or unavailable during this period
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarAvailabilityManager;