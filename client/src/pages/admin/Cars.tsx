import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { CarType } from '@/components/CarsShowcase';
import AdminLayout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, X, Car, Upload } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

interface CarApiResponse {
  success: boolean;
  data: CarType;
  message?: string;
}

const carFormSchema = z.object({
  name: z.string().min(2, { message: "Car name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Car type is required" }),
  seats: z.coerce.number().min(1, { message: "Car must have at least 1 seat" }),
  power: z.string().min(1, { message: "Power/range information is required" }),
  rating: z.string().regex(/^[0-9](\.[0-9])?$/, { message: "Rating must be in format X.X" }),
  price: z.string().regex(/^[0-9]+$/, { message: "Price must be a number" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  special: z.string().optional(),
  specialColor: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type CarFormValues = z.infer<typeof carFormSchema>;

const AdminCars: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Cars');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  const { data: carsResponse, isLoading } = useQuery<ApiResponse<CarType>>({
    queryKey: ['/api/cars', selectedType !== 'All Cars' ? selectedType : null],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const cars = carsResponse?.data || [];
  const carTypes = ["All Cars", "SUVs", "Luxury", "Sports", "Electric", "Premium"];
  
  // Filter cars based on search
  const filteredCars = searchQuery
    ? cars.filter(car => 
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cars;

  // Create a new car mutation
  const createCarMutation = useMutation({
    mutationFn: (car: CarFormValues) => 
      apiRequest('POST', '/api/cars', car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Car Added",
        description: "The car has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Car",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: ({ id, car }: { id: number, car: Partial<CarFormValues> }) => 
      apiRequest('PUT', `/api/cars/${id}`, car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Car Updated",
        description: "The car has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Car",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Car Deleted",
        description: "The car has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Car",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const addForm = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: '',
      type: '',
      seats: 0,
      power: '',
      rating: '4.5',
      price: '',
      image: '',
      special: '',
      specialColor: '',
      description: '',
      features: [],
    }
  });

  const editForm = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: selectedCar?.name || '',
      type: selectedCar?.type || '',
      seats: selectedCar?.seats || 0,
      power: selectedCar?.power || '',
      rating: selectedCar?.rating || '4.5',
      price: selectedCar?.price || '',
      image: selectedCar?.image || '',
      special: selectedCar?.special || '',
      specialColor: selectedCar?.specialColor || '',
      description: selectedCar?.description || '',
      features: selectedCar?.features || [],
    }
  });

  const handleAddCar = (data: CarFormValues) => {
    createCarMutation.mutate(data);
  };

  const handleEditCar = (data: CarFormValues) => {
    if (selectedCar) {
      updateCarMutation.mutate({ id: selectedCar.id, car: data });
    }
  };

  const handleDeleteCar = () => {
    if (selectedCar) {
      deleteCarMutation.mutate(selectedCar.id);
    }
  };

  const openEditDialog = (car: CarType) => {
    setSelectedCar(car);
    editForm.reset({
      name: car.name,
      type: car.type,
      seats: car.seats,
      power: car.power,
      rating: car.rating,
      price: car.price,
      image: car.image,
      special: car.special || '',
      specialColor: car.specialColor || '',
      description: car.description || '',
      features: car.features || [],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (car: CarType) => {
    setSelectedCar(car);
    setIsDeleteDialogOpen(true);
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>, form: any) => {
    const features = e.target.value.split('\n').filter(feature => feature.trim() !== '');
    form.setValue('features', features);
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Cars</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cars..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Car Inventory</CardTitle>
            <CardDescription>Manage your car fleet - {filteredCars.length} cars found</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                <p>No cars found</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  Add Your First Car
                </Button>
              </div>
            ) : (
              <Table>
                <TableCaption>A list of all cars in your fleet.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead className="w-[150px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Power/Range</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.id}</TableCell>
                      <TableCell>
                        <div className="w-20 h-12 rounded bg-gray-100 overflow-hidden">
                          {car.image && (
                            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{car.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{car.type}</Badge>
                      </TableCell>
                      <TableCell>{car.seats}</TableCell>
                      <TableCell>{car.power}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{car.rating}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </TableCell>
                      <TableCell>${car.price}/day</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(car)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(car)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
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
      </div>
      
      {/* Add Car Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Car</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new car to your fleet.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddCar)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mercedes AMG GT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carTypes.filter(type => type !== 'All Cars').map((type) => (
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
                
                <FormField
                  control={addForm.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power/Range</FormLabel>
                      <FormControl>
                        <Input placeholder="523 HP or 405 mi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input placeholder="4.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Day</FormLabel>
                      <FormControl>
                        <Input placeholder="299" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="special"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Badge</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium or Electric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="specialColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Color</FormLabel>
                      <FormControl>
                        <Input placeholder="bg-[#6843EC] bg-opacity-90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input placeholder="https://example.com/car-image.jpg" {...field} />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the car image or upload a new one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]"
                        placeholder="Describe the car and its key selling points..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]"
                        placeholder="Enter car features (one per line)
e.g. 
Luxury Interior
Performance Tuned
Carbon Fiber Trim"
                        value={field.value?.join('\n') || ''}
                        onChange={(e) => handleFeatureChange(e, addForm)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter each feature on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCarMutation.isPending}>
                  {createCarMutation.isPending ? 'Adding...' : 'Add Car'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Car Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>
              Update the details for {selectedCar?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCar)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carTypes.filter(type => type !== 'All Cars').map((type) => (
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
                
                <FormField
                  control={editForm.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power/Range</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="special"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Badge</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Badge Color</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input {...field} />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    {field.value && (
                      <div className="mt-2 rounded-md overflow-hidden w-40 h-24">
                        <img src={field.value} alt="Car preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]"
                        value={field.value?.join('\n') || ''}
                        onChange={(e) => handleFeatureChange(e, editForm)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter each feature on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCarMutation.isPending}>
                  {updateCarMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Car Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCar?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCar && (
            <div className="flex items-center space-x-4 p-4 rounded-md bg-gray-50">
              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-semibold">{selectedCar.name}</h4>
                <p className="text-sm text-gray-500">{selectedCar.type} • ${selectedCar.price}/day</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deleteCarMutation.isPending}
            >
              {deleteCarMutation.isPending ? 'Deleting...' : 'Delete Car'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCars;