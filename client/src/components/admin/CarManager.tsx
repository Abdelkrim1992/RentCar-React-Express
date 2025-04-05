import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { Car, Edit, Plus, Trash2, Check, X, Image, Tag, Star, Users, Battery, Wrench, Warehouse } from 'lucide-react';

// Define API response interface
interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogClose,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Form schema for car management
const carFormSchema = z.object({
  name: z.string().min(1, 'Car name is required'),
  type: z.string().min(1, 'Car type is required'),
  seats: z.coerce.number().min(1, 'Number of seats is required'),
  power: z.string().min(1, 'Power spec is required'),
  rating: z.string().min(1, 'Car rating is required'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().url('Valid image URL is required'),
  special: z.string().nullable().optional(),
  specialColor: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  year: z.coerce.number().min(1900, 'Valid year is required'),
  brand: z.string().min(1, 'Brand is required'),
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface Car {
  id: number;
  name: string;
  type: string;
  seats: number;
  power: string;
  rating: string;
  price: string;
  image: string;
  special?: string | null;
  specialColor?: string | null;
  description?: string | null;
  features: string[];
  available: boolean;
  year: number;
  brand: string;
  createdAt: string;
}

const CarManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');
  const [editFeaturesInput, setEditFeaturesInput] = useState('');

  // Get all cars
  const { data: carsResponse, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['/api/cars'],
    // Poll for updates every 15 seconds
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  });
  
  // Extract cars from response and ensure it's an array
  const cars = Array.isArray(carsResponse?.data) ? carsResponse?.data : [];

  // Form for adding new car
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: '',
      type: '',
      seats: 4,
      power: '',
      rating: '4.5',
      price: '',
      image: '',
      special: '',
      specialColor: '',
      description: '',
      features: [],
      available: true,
      year: new Date().getFullYear(),
      brand: '',
    },
  });

  // Form for editing car
  const editForm = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: '',
      type: '',
      seats: 4,
      power: '',
      rating: '4.5',
      price: '',
      image: '',
      special: '',
      specialColor: '',
      description: '',
      features: [],
      available: true,
      year: new Date().getFullYear(),
      brand: '',
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: CarFormValues) =>
      apiRequest('POST', '/api/cars', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car added successfully',
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add car',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CarFormValues & { id: number }) =>
      apiRequest(
        'PUT', 
        `/api/cars/${data.id}`, 
        {
          name: data.name,
          type: data.type,
          seats: data.seats,
          power: data.power,
          rating: data.rating,
          price: data.price,
          image: data.image,
          special: data.special,
          specialColor: data.specialColor,
          description: data.description,
          features: data.features,
          available: data.available,
          year: data.year,
          brand: data.brand,
        }
      ),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedCar(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update car',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/cars/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Car deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete car',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle form submission for new car
  function onSubmit(data: CarFormValues) {
    addMutation.mutate(data);
  }

  // Handle edit form submission
  function onEditSubmit(data: CarFormValues) {
    if (selectedCar) {
      updateMutation.mutate({
        ...data,
        id: selectedCar.id,
      });
    }
  }

  // Handle edit click
  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    
    editForm.reset({
      name: car.name,
      type: car.type,
      seats: car.seats,
      power: car.power,
      rating: car.rating,
      price: car.price,
      image: car.image,
      special: car.special || null,
      specialColor: car.specialColor || null,
      description: car.description || null,
      features: car.features || [],
      available: car.available,
      year: car.year,
      brand: car.brand,
    });
    
    setEditFeaturesInput(car.features.join(', '));
    setIsEditDialogOpen(true);
  };

  // Handle delete click
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this car? This will also remove any availability records associated with it.')) {
      deleteMutation.mutate(id);
    }
  };

  // Function to handle adding features
  const handleAddFeature = () => {
    if (featuresInput.trim()) {
      const newFeatures = featuresInput.split(',').map(f => f.trim()).filter(f => f);
      form.setValue('features', [...form.getValues('features'), ...newFeatures]);
      setFeaturesInput('');
    }
  };

  // Function to handle adding features in edit mode
  const handleEditFeature = () => {
    if (editFeaturesInput.trim()) {
      const newFeatures = editFeaturesInput.split(',').map(f => f.trim()).filter(f => f);
      editForm.setValue('features', newFeatures);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Car Management</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()}
            title="Refresh cars list"
            className="ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </Button>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Car</DialogTitle>
              <DialogDescription>
                Enter the details for the new car listing.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tesla Model S" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Tesla" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Compact">Compact</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seats</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" min="2000" max="2030" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Power</FormLabel>
                        <FormControl>
                          <Input placeholder="370 HP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (1-5)</FormLabel>
                        <FormControl>
                          <Input placeholder="4.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day</FormLabel>
                        <FormControl>
                          <Input placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/car-image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="special"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Tag (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="New Arrival" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Tag Color (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="bg-green-500" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Experience luxury and performance with this premium vehicle..." 
                          className="resize-none min-h-20"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="mb-2">
                    <FormLabel>Features</FormLabel>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="Bluetooth, Navigation, etc (comma separated)"
                        value={featuresInput}
                        onChange={(e) => setFeaturesInput(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddFeature}>
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.watch('features').map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                        <button
                          type="button"
                          className="ml-1 text-red-500 hover:text-red-700"
                          onClick={() => {
                            const currentFeatures = form.getValues('features');
                            form.setValue(
                              'features',
                              currentFeatures.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                    {form.watch('features').length === 0 && (
                      <span className="text-sm text-gray-500">No features added yet</span>
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Available</FormLabel>
                        <FormDescription>
                          Is this car generally available for booking?
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
                    {addMutation.isPending ? 'Saving...' : 'Save Car'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Car Listings</CardTitle>
          <CardDescription>
            Manage your fleet of rental cars. Add, edit, or remove car listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading cars...</p>
          ) : isError ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">There was an error loading cars.</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cars'] })}
              >
                Try Again
              </Button>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No cars found. Add some using the button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of all cars in your fleet</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Car</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car: Car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-semibold">{car.name}</div>
                            <div className="text-xs text-gray-500">{car.brand} ({car.year})</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{car.type}</Badge>
                      </TableCell>
                      <TableCell>{car.seats}</TableCell>
                      <TableCell>${car.price}/day</TableCell>
                      <TableCell>
                        <Badge variant={car.available ? "default" : "secondary"}>
                          {car.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(car)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(car.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>
              Update the details for this car listing.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Tesla Model S" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Tesla" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" min="2000" max="2030" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power</FormLabel>
                      <FormControl>
                        <Input placeholder="370 HP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input placeholder="4.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Day</FormLabel>
                      <FormControl>
                        <Input placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/car-image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="special"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Tag (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="New Arrival" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="specialColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Tag Color (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="bg-green-500" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Experience luxury and performance with this premium vehicle..." 
                        className="resize-none min-h-20"
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <div className="mb-2">
                  <FormLabel>Features</FormLabel>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Bluetooth, Navigation, etc (comma separated)"
                      value={editFeaturesInput}
                      onChange={(e) => setEditFeaturesInput(e.target.value)}
                      onBlur={handleEditFeature}
                    />
                    <Button type="button" onClick={handleEditFeature}>
                      Update
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editForm.watch('features').length > 0 ? (
                    editForm.watch('features').map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No features added yet</span>
                  )}
                </div>
              </div>
              
              <FormField
                control={editForm.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>
                        Is this car generally available for booking?
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
                <Button variant="outline" type="button" asChild>
                  <DialogClose>Cancel</DialogClose>
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Update Car'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarManager;