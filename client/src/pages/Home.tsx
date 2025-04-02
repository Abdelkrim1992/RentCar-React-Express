import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import CarsShowcase from '@/components/CarsShowcase';
import Features from '@/components/Features';
import Stats from '@/components/Stats';
import Booking from '@/components/Booking';
import Testimonials from '@/components/Testimonials';
import AppDownload from '@/components/AppDownload';
import Footer from '@/components/Footer';
import AvailabilityChecker from '@/components/AvailabilityChecker';
import UserRecommendations from '@/components/UserRecommendations';
import UserPreferencesForm from '@/components/UserPreferencesForm';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('USD');
  
  // Get site settings to get the default currency
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch site settings');
      }
      const data = await response.json();
      return data.data;
    },
  });
  
  // Set currency based on site settings
  useEffect(() => {
    if (siteSettings?.defaultCurrency) {
      setCurrency(siteSettings.defaultCurrency);
    }
  }, [siteSettings]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Partners />
      <AvailabilityChecker />
      
      {/* Show recommendations if user is logged in */}
      {user && (
        <div className="mt-6 mb-6">
          <UserRecommendations currency={currency} />
        </div>
      )}
      
      <CarsShowcase />
      <Features />
      <Stats />
      
      {/* Add user preferences form button if user is logged in */}
      {user && (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Personalize Your Experience</h2>
          <p className="text-muted-foreground mb-6">
            Set your preferences to get personalized car recommendations that match your needs.
          </p>
          <UserPreferencesForm />
        </div>
      )}
      
      <Booking />
      <Testimonials />
      <AppDownload />
      <Footer />
    </div>
  );
};

export default Home;