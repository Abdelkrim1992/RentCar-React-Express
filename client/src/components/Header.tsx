import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="#" className="font-turret text-3xl font-bold tracking-wider text-black">
            <span className="text-[#6843EC]">ETHER</span><span className="text-[#D2FF3A]">.</span>
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </nav>
          
          <div className="flex items-center space-x-4">
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
                  <a href="#booking" className="mt-4">
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
      <NavLink href="#testimonials" label="Testimonials" />
    </>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  return (
    <a 
      href={href} 
      className="font-work font-medium relative group"
    >
      {label}
      <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-[#D2FF3A] transition-all duration-300 group-hover:w-full"></span>
    </a>
  );
};

export default Header;
