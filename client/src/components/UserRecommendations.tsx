import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Car } from '../../shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface CarCardProps {
  car: Car;
  currency: string;
}

const CarCard: React.FC<CarCardProps> = ({ car, currency }) => {
  // Format price based on currency
  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'MAD';
    const conversionRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 9.82;
    
    const convertedPrice = (numericPrice * conversionRate).toFixed(2);
    return `${currencySymbol}${convertedPrice}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold line-clamp-1">{car.name}</CardTitle>
        <Badge variant="outline" className="mt-1">
          {car.type}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="relative aspect-video mb-4 overflow-hidden rounded-md">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          {car.special && (
            <span 
              className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: car.specialColor || '#4CAF50', color: 'white' }}
            >
              {car.special}
            </span>
          )}
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {car.seats} Seats
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fuel"><path d="M3 14h3a2 2 0 0 0 2-2v-2H3v4Z"/><path d="M7 12V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v9c0 1.5 1.5 3 3 3"/><path d="M16 4h-4a1 1 0 0 0-1 1v14c0 .6.4 1 1 1h4c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1Z"/><path d="M16 8h4"/><path d="M20 15v-4a1 1 0 0 0-1-1h-3"/><path d="M7 12h10"/></svg>
            {car.power}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-yellow-500 mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-sm">{car.rating}</span>
          </div>
          <span className="font-bold">{formatPrice(car.price)}/day</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/cars/${car.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const UserRecommendations: React.FC<{ currency: string }> = ({ currency }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Only fetch recommendations if user is logged in
  const { data: recommendedCars, isLoading, isError } = useQuery({
    queryKey: ['/api/user/recommendations'],
    queryFn: async () => {
      if (!user) return null;
      
      const response = await fetch('/api/user/recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      return data.data as Car[];
    },
    enabled: !!user, // Only run if user is logged in
  });

  if (!user) {
    return null; // Don't show anything if user is not logged in
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Your Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full flex flex-col">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <Skeleton className="h-48 w-full mb-4" />
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !recommendedCars || recommendedCars.length === 0) {
    return null; // Don't show anything if there's an error or no recommendations
  }

  return (
    <div className="bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
        <p className="text-muted-foreground mb-6">Based on your preferences</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCars.map((car) => (
            <CarCard key={car.id} car={car} currency={currency} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRecommendations;