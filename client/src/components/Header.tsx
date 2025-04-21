import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import { useQuery } from '@tanstack/react-query';

interface SiteSettingsResponse {
  success: boolean;
  data: {
    id: number;
    siteName: string;
    logoColor: string;
    accentColor: string;
    logoText: string;
    customLogo: string | null;
    updatedAt: string;
  };
}

const Header: React.FC = () => {
  // Get site settings to retrieve colors
  const { data: siteSettingsResponse } = useQuery<SiteSettingsResponse>({
    queryKey: ['/api/settings'],
  });
  
  // Default colors if settings not loaded
  const primaryColor = siteSettingsResponse?.data?.accentColor || '#6843EC';
  const secondaryColor = siteSettingsResponse?.data?.logoColor || '#D2FF3A';
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="#" className="font-turret text-3xl font-bold tracking-wider text-black">
            <span style={{ color: primaryColor }}>ETHER</span><span style={{ color: secondaryColor }}>.</span>
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </nav>
          
          <div className="flex items-center space-x-4">
            <CurrencySelector className="hidden sm:flex" />
            
            <a href="#booking" className="hidden md:block">
              <Button variant="default" className="bg-black text-white hover:bg-black/90">
                Rent Now
              </Button>
            </a>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="mt-4">
                    <CurrencySelector className="w-full mb-4" />
                  </div>
                  <a href="#booking" className="mt-2">
                    <Button className="w-full bg-black text-white hover:bg-black/90">
                      Rent Now
                    </Button>
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLinks: React.FC = () => {
  return (
    <>
      <NavLink href="#cars" label="Fleet" />
      <NavLink href="#features" label="Features" />
      <NavLink href="#booking" label="Book Now" />
      <NavLink href="/my-bookings" label="My Bookings" isPage={true} />
      <NavLink href="#testimonials" label="Testimonials" />
    </>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
  isPage?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, isPage = false }) => {
  return (
    <a 
      href={href} 
      className="font-work font-medium relative group"
      // Use regular navigation for page links, otherwise keep the hash behavior
      onClick={isPage ? undefined : (e) => {
        if (href.startsWith('#')) {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      {label}
      <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#D2FF3A] transition-all duration-300 group-hover:w-full"></span>
    </a>
  );
};

export default Header;
