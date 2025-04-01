import React from 'react';
import { SiMercedes, SiBmw, SiAudi, SiTesla, SiPorsche, SiJaguar } from 'react-icons/si';

const Partners: React.FC = () => {
  const partners = [
    { name: "Mercedes", icon: SiMercedes, height: "h-12" },
    { name: "BMW", icon: SiBmw, height: "h-10" },
    { name: "Audi", icon: SiAudi, height: "h-10" },
    { name: "Tesla", icon: SiTesla, height: "h-8" },
    { name: "Porsche", icon: SiPorsche, height: "h-12" },
    { name: "Jaguar", icon: SiJaguar, height: "h-10" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <p className="text-center text-gray-500 mb-8 font-work">TRUSTED BY LEADING COMPANIES</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div 
              key={index} 
              className={`${partner.height} opacity-60 hover:opacity-100 transition-opacity`}
            >
              <partner.icon className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
