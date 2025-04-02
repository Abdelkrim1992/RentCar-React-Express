import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { getQueryFn } from '@/lib/queryClient';
import { CheckCircle, ArrowLeft, MapPin, Calendar, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    queryKey: ['/api/cars', carId],
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Car Image Section */}
            <div>
              <motion.div 
                className="relative rounded-3xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-[400px] object-cover"
                />
                {car.special && (
                  <div className={`absolute top-4 left-4 ${car.specialColor || 'bg-black bg-opacity-60'} text-white px-3 py-1 rounded-lg text-sm`}>
                    {car.special}
                  </div>
                )}
              </motion.div>
              
              <div className="mt-8">
                <h3 className="font-darker font-bold text-xl mb-4">Features & Specifications</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-gray-500 text-sm mb-1">Type</div>
                    <div className="font-medium">{car.type}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-gray-500 text-sm mb-1">Seats</div>
                    <div className="font-medium">{car.seats}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-gray-500 text-sm mb-1">{car.type === "Electric" ? "Range" : "Power"}</div>
                    <div className="font-medium">{car.power}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-gray-500 text-sm mb-1">Rating</div>
                    <div className="font-medium flex items-center justify-center">
                      <span>{car.rating}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {car.features && car.features.length > 0 && (
                  <div>
                    <h4 className="font-darker font-semibold text-lg mb-3">Key Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {car.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-[#6843EC]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Car Details Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-darker font-bold text-3xl md:text-4xl">{car.name}</h1>
                  <Badge className="bg-[#6843EC]">{car.type}</Badge>
                </div>
                
                <div className="flex items-center mb-6">
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
                  <span className="ml-2 text-gray-600">{car.rating}/5 - Customer Rating</span>
                </div>
                
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {car.description || 
                      `Experience luxury and performance with the ${car.name}. This premium ${car.type ? car.type.toLowerCase() : 'luxury'} vehicle offers exceptional comfort, powerful performance, and state-of-the-art features for an unforgettable driving experience.`}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <div className="text-3xl font-darker font-bold text-[#6843EC]">
                      {formatPrice(car.price, currency)}
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                    <Button 
                      className="px-8 py-6 bg-black text-white hover:bg-black/90 font-semibold w-full sm:w-auto"
                      onClick={() => navigate(`/booking/${carId}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                  <h3 className="font-darker font-bold text-xl mb-4">Rental Information</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                      <div>
                        <h4 className="font-medium">Pickup & Return Locations</h4>
                        <p className="text-gray-600 text-sm">Multiple locations available across the city, including airport terminals and downtown offices.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                      <div>
                        <h4 className="font-medium">Flexible Rental Duration</h4>
                        <p className="text-gray-600 text-sm">Daily, weekly, and monthly rental options available with special discounts for longer periods.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                      <div>
                        <h4 className="font-medium">Comprehensive Insurance</h4>
                        <p className="text-gray-600 text-sm">Full insurance coverage included with options for premium protection packages.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-5 w-5 mr-3 mt-0.5 text-[#6843EC]" />
                      <div>
                        <h4 className="font-medium">Secure Booking</h4>
                        <p className="text-gray-600 text-sm">Easy cancellation up to 24 hours before your scheduled pickup with no fees.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full py-6 bg-gradient-to-r from-[#6843EC] to-[#D2FF3A] hover:from-[#5733dc] hover:to-[#c2ef2a] text-white font-semibold"
                  onClick={() => navigate(`/booking/${carId}`)}
                >
                  Reserve This Car
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;