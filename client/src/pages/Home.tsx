import React from 'react';
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

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Partners />
      <CarsShowcase />
      <Features />
      <Stats />
      <Booking />
      <Testimonials />
      <AppDownload />
      <Footer />
    </div>
  );
};

export default Home;
