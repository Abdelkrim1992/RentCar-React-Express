import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPreferences } from '../../shared/schema';

// Form schema
const formSchema = z.object({
  preferredCarTypes: z.array(z.string()).min(1, "Select at least one car type"),
  preferredFeatures: z.array(z.string()),
  minSeats: z.number().int().min(1).optional(),
  maxBudget: z.number().positive().optional(),
  travelPurpose: z.string().optional(),
  rentalFrequency: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Available car types and features
const CAR_TYPES = ['SUV', 'Sedan', 'Truck', 'Sports', 'Van', 'Luxury', 'Compact', 'Electric'];
const CAR_FEATURES = [
  'GPS Navigation', 
  'Bluetooth', 
  'Backup Camera', 
  'Sunroof', 
  'Leather Seats', 
  'Heated Seats', 
  'Apple CarPlay', 
  'Android Auto',
  'Keyless Entry',
  'Automatic Transmission'
];
const RENTAL_FREQUENCIES = ['Weekly', 'Monthly', 'Occasionally', 'Once', 'Quarterly', 'Yearly'];
const TRAVEL_PURPOSES = ['Business', 'Leisure', 'Family', 'Moving', 'Adventure'];

// The main component
const UserPreferencesForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch existing preferences if user is logged in
  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ['/api/user/preferences'],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const response = await fetch('/api/user/preferences');
        if (response.status === 404) {
          return null; // User has no preferences yet
        }
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const data = await response.json();
        return data.data as UserPreferences;
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Set up form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredCarTypes: [],
      preferredFeatures: [],
      minSeats: undefined,
      maxBudget: undefined,
      travelPurpose: undefined,
      rentalFrequency: undefined,
    },
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (userPreferences) {
      form.reset({
        preferredCarTypes: userPreferences.preferredCarTypes || [],
        preferredFeatures: userPreferences.preferredFeatures || [],
        minSeats: userPreferences.minSeats || undefined,
        maxBudget: userPreferences.maxBudget || undefined,
        travelPurpose: userPreferences.travelPurpose || undefined,
        rentalFrequency: userPreferences.rentalFrequency || undefined,
      });
    }
  }, [userPreferences, form]);

  // Mutation to save preferences
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/recommendations'] });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  // Only show the form if user is logged in
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Preferences</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Car Preferences</DialogTitle>
          <DialogDescription>
            Set your preferences to get personalized car recommendations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Car Types */}
            <FormField
              control={form.control}
              name="preferredCarTypes"
              render={() => (
                <FormItem>
                  <FormLabel>Preferred Car Types</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CAR_TYPES.map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="preferredCarTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Car Features */}
            <FormField
              control={form.control}
              name="preferredFeatures"
              render={() => (
                <FormItem>
                  <FormLabel>Preferred Features</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CAR_FEATURES.map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="preferredFeatures"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, feature])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== feature
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {feature}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Min Seats */}
            <FormField
              control={form.control}
              name="minSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum number of seats you need in a car
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Budget */}
            <FormField
              control={form.control}
              name="maxBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Budget ($ per day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Your maximum budget per day in USD
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Travel Purpose */}
            <FormField
              control={form.control}
              name="travelPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Purpose</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a travel purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRAVEL_PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rental Frequency */}
            <FormField
              control={form.control}
              name="rentalFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How often do you rent?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RENTAL_FREQUENCIES.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserPreferencesForm;