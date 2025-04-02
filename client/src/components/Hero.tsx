import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-[#6843EC]/20 blur-[120px] z-[-1]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-[#D2FF3A]/15 blur-[100px] z-[-1]"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 pb-8 md:pb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h5 className="font-darker font-semibold text-[#6843EC] mb-2">PREMIUM CAR RENTAL</h5>
            <h1 className="font-darker font-bold text-5xl md:text-7xl leading-none mb-6">
              Drive Your <span className="gradient-text">Dreams</span> Today
            </h1>
            <p className="font-work text-lg text-gray-700 mb-8 max-w-lg">
              Experience unparalleled luxury and performance with our premium fleet. From sporty convertibles to elegant sedans, find the perfect ride for any occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="px-8 py-6 bg-black text-white hover:bg-black/90 font-semibold text-base"
                asChild
              >
                <a href="#availability-checker">Book a Car</a>
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-6 border-black text-black hover:bg-black hover:text-white font-semibold text-base"
                asChild
              >
                <a href="#cars">Explore Fleet</a>
              </Button>
            </div>
            
            <div className="flex items-center mt-10">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-white w-10 h-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-10 h-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-10 h-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4">
                <p className="font-medium">Trusted by 10,000+ customers</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=80" className="w-full rounded-3xl shadow-lg" alt="Premium Car" />
            
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6843EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup in</p>
                  <p className="font-semibold">15 minutes</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-[#6843EC] to-[#D2FF3A] p-5 rounded-2xl text-white">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">No hidden fees</p>
                  <p className="font-semibold">All inclusive</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
