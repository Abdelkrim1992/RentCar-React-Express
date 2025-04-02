import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { getQueryFn } from '@/lib/queryClient';
import { 
  CheckCircle, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Lock, 
  Shield, 
  Car, 
  Fuel, 
  Zap, 
  Award, 
  CircleDollarSign, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CarType } from '@/components/CarsShowcase';
import { formatPrice } from '@/components/CurrencySelector';

// Response type definition from API
interface CarResponse {
  success: boolean;
  data: CarType;
}

const CarDetails: React.FC = () => {
  const [, params] = useRoute('/cars/:id');
  const carId = params?.id;
  const [, navigate] = useLocation();
  
  // Debug logging
  useEffect(() => {
    console.log("Car ID from params:", carId);
  }, [carId]);
  const [currency, setCurrency] = useState('USD');
  
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
  
  const { data: carResponse, isLoading, error } = useQuery<CarResponse>({
    queryKey: [`/api/cars/${carId}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!carId,
  });

  const car = carResponse?.data;

  if (isLoading) {
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

  if (error || !car) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
          <p className="text-gray-500 mb-6">The car you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/#cars">Browse Cars</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Link href="/#cars">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cars
            </Button>
          </Link>
          
          {/* Car Hero Section with Gradient Background */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 mb-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="inline-flex mb-2">
                  <Badge className="bg-[#6843EC] px-3 py-1 text-sm">{car.type}</Badge>
                  {car.special && (
                    <Badge className={`ml-2 px-3 py-1 text-sm ${car.specialColor || 'bg-black'}`}>{car.special}</Badge>
                  )}
                </div>
                <h1 className="font-darker font-bold text-4xl md:text-5xl">{car.name}</h1>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${parseFloat(car.rating) > i ? 'text-yellow-400' : 'text-gray-300'}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 font-medium">{car.rating}/5 • Customer Rating</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Starting from</div>
                    <div className="text-3xl font-darker font-bold text-[#6843EC]">
                      {formatPrice(car.price, currency)}
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                  </div>
                  <Button 
                    className="px-8 py-6 bg-black text-white hover:bg-black/90 font-semibold w-full sm:w-auto ml-auto sm:ml-0"
                    onClick={() => navigate(`/booking/${carId}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-3xl overflow-hidden shadow-xl h-[300px] lg:h-[360px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
          
          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="mb-10">
            <TabsList className="mb-8 w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="rental">Rental Info</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Car Description</CardTitle>
                      <CardDescription>Get to know the {car.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {car.description || 
                          `Experience luxury and performance with the ${car.name}. This premium ${car.type ? car.type.toLowerCase() : 'luxury'} vehicle offers exceptional comfort, powerful performance, and state-of-the-art features for an unforgettable driving experience.`}
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                          <Car className="h-6 w-6 mx-auto mb-2 text-[#6843EC]" />
                          <div className="text-gray-500 text-sm mb-1">Type</div>
                          <div className="font-medium">{car.type}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                          <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6843EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="text-gray-500 text-sm mb-1">Seats</div>
                          <div className="font-medium">{car.seats}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                          {car.type === "Electric" ? 
                            <Zap className="h-6 w-6 mx-auto mb-2 text-[#6843EC]" /> : 
                            <Fuel className="h-6 w-6 mx-auto mb-2 text-[#6843EC]" />
                          }
                          <div className="text-gray-500 text-sm mb-1">{car.type === "Electric" ? "Range" : "Power"}</div>
                          <div className="font-medium">{car.power}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                          <Award className="h-6 w-6 mx-auto mb-2 text-[#6843EC]" />
                          <div className="text-gray-500 text-sm mb-1">Rating</div>
                          <div className="font-medium flex items-center justify-center">
                            <span>{car.rating}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-[#6843EC] text-white h-full">
                    <CardHeader>
                      <CardTitle className="text-white">Pricing</CardTitle>
                      <CardDescription className="text-white/80">Flexible rental options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            <span>Daily Rate</span>
                          </div>
                          <span className="font-bold">{formatPrice(car.price, currency)}</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            <span>Weekly Rate</span>
                          </div>
                          <span className="font-bold">{formatPrice((parseFloat(car.price) * 6.5).toString(), currency)}</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CircleDollarSign className="h-5 w-5 mr-2" />
                            <span>Monthly Rate</span>
                          </div>
                          <span className="font-bold">{formatPrice((parseFloat(car.price) * 26).toString(), currency)}</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="text-sm mt-6">
                          <p className="mb-2">* Weekly rate includes 7 days at the price of 6.5</p>
                          <p>* Monthly rate includes 30 days at the price of 26</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>Explore what makes this {car.name} special</CardDescription>
                </CardHeader>
                <CardContent>
                  {car.features && car.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {car.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
                          <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC] shrink-0" />
                          <div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Feature information coming soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Specifications Tab */}
            <TabsContent value="specifications">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Specifications</CardTitle>
                  <CardDescription>Technical information about the {car.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Performance & Mechanical</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Vehicle Type:</span>
                          <span className="w-1/2">{car.type}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">{car.type === "Electric" ? "Range:" : "Power:"}</span>
                          <span className="w-1/2">{car.power}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Transmission:</span>
                          <span className="w-1/2">{car.type === "Electric" ? "Single-speed" : "Automatic"}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Drive Type:</span>
                          <span className="w-1/2">{car.type === "Electric" ? "All-Wheel Drive" : "Rear-Wheel Drive"}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Top Speed:</span>
                          <span className="w-1/2">{car.type === "Electric" ? "250 km/h" : "220 km/h"}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Dimensions & Capacity</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Seating Capacity:</span>
                          <span className="w-1/2">{car.seats} adults</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Luggage Capacity:</span>
                          <span className="w-1/2">{car.seats > 4 ? "540L" : "380L"}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Fuel Tank:</span>
                          <span className="w-1/2">{car.type === "Electric" ? "N/A" : "65L"}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Length:</span>
                          <span className="w-1/2">{car.seats > 4 ? "4.9m" : "4.6m"}</span>
                        </li>
                        <li className="flex items-start border-b border-gray-100 pb-2">
                          <span className="w-1/2 font-medium text-gray-700">Width:</span>
                          <span className="w-1/2">{car.seats > 4 ? "1.9m" : "1.8m"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Rental Information Tab */}
            <TabsContent value="rental">
              <Card>
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                  <CardDescription>Everything you need to know about renting the {car.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                        <div>
                          <h4 className="font-medium text-lg">Pickup & Return Locations</h4>
                          <p className="text-gray-600">Multiple locations available across the city, including airport terminals and downtown offices.</p>
                          <div className="mt-3 text-sm space-y-1">
                            <p className="flex items-center"><span className="w-24 font-medium">Airport:</span> Terminal 1 & 2 Desks</p>
                            <p className="flex items-center"><span className="w-24 font-medium">Downtown:</span> Central Station</p>
                            <p className="flex items-center"><span className="w-24 font-medium">Hotel:</span> Delivery available</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                        <div>
                          <h4 className="font-medium text-lg">Flexible Rental Duration</h4>
                          <p className="text-gray-600">Daily, weekly, and monthly rental options available with special discounts for longer periods.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                        <div>
                          <h4 className="font-medium text-lg">Comprehensive Insurance</h4>
                          <p className="text-gray-600">Full insurance coverage included with options for premium protection packages.</p>
                          <div className="mt-3 text-sm space-y-1">
                            <p className="flex items-center"><span className="w-32 font-medium">Basic Coverage:</span> Included</p>
                            <p className="flex items-center"><span className="w-32 font-medium">Premium Protection:</span> +15% daily rate</p>
                            <p className="flex items-center"><span className="w-32 font-medium">Super Protection:</span> +25% daily rate</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Lock className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                        <div>
                          <h4 className="font-medium text-lg">Secure Booking</h4>
                          <p className="text-gray-600">Easy cancellation up to 24 hours before your scheduled pickup with no fees.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button 
                      className="w-full sm:w-auto py-6 bg-gradient-to-r from-[#6843EC] to-[#D2FF3A] hover:from-[#5733dc] hover:to-[#c2ef2a] text-white font-semibold"
                      onClick={() => navigate(`/booking/${carId}`)}
                    >
                      Reserve This Car
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;