import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CarType {
  id: number;
  name: string;
  type: string;
  seats: number;
  power: string;
  rating: number;
  price: number;
  image: string;
  special?: string;
  special_color?: string;
}

const cars: CarType[] = [
  {
    id: 1,
    name: "Mercedes AMG GT",
    type: "Sports",
    seats: 2,
    power: "523 HP",
    rating: 4.9,
    price: 299,
    image: "https://images.unsplash.com/photo-1617814076668-8dfc6fe3b744?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
    special: "Premium"
  },
  {
    id: 2,
    name: "Tesla Model S",
    type: "Electric",
    seats: 5,
    power: "405 mi",
    rating: 4.8,
    price: 249,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
    special: "Electric",
    special_color: "bg-[#6843EC] bg-opacity-90"
  },
  {
    id: 3,
    name: "Range Rover Sport",
    type: "SUV",
    seats: 5,
    power: "395 HP",
    rating: 4.7,
    price: 269,
    image: "https://images.unsplash.com/photo-1599912027611-484b9fc447af?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
    special: "Premium"
  }
];

const CarsShowcase: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Cars");
  const filters = ["All Cars", "SUVs", "Luxury", "Sports", "Electric"];

  return (
    <section id="cars" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h5 className="font-darker font-semibold text-[#6843EC] mb-2">OUR PREMIUM FLEET</h5>
          <h2 className="font-darker font-bold text-4xl md:text-5xl mb-6">Discover Our Exceptional Vehicles</h2>
          <p className="font-work text-gray-700">
            Choose from our carefully selected fleet of premium vehicles, offering unmatched performance, comfort, and style for every journey.
          </p>
        </motion.div>
        
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              className={selectedFilter === filter 
                ? "bg-black text-white hover:bg-black/90" 
                : "bg-white text-black border-gray-200 hover:border-black"}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            className="px-8 py-6 border-black text-black hover:bg-black hover:text-white font-semibold text-base"
            asChild
          >
            <a href="#">
              View All Vehicles
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface CarCardProps {
  car: CarType;
  index: number;
}

const CarCard: React.FC<CarCardProps> = ({ car, index }) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      viewport={{ once: true }}
    >
      <div className="relative">
        <img src={car.image} className="w-full h-64 object-cover" alt={car.name} />
        <div className={`absolute top-4 left-4 ${car.special_color || 'bg-black bg-opacity-60'} text-white px-3 py-1 rounded-lg text-sm`}>
          {car.special}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center">
          <Button className="px-5 py-2.5 bg-[#D2FF3A] text-black font-semibold hover:bg-[#D2FF3A]/90">
            View Details
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-darker font-bold text-2xl">{car.name}</h3>
          <div className="flex items-center text-yellow-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 font-semibold">{car.rating}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Type</div>
            <div className="font-medium">{car.type}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Seats</div>
            <div className="font-medium">{car.seats}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">{car.type === "Electric" ? "Range" : "Power"}</div>
            <div className="font-medium">{car.power}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500">From</span>
            <span className="font-darker font-bold text-2xl ml-1">${car.price}</span>
            <span className="text-gray-500">/day</span>
          </div>
          <Button 
            className="bg-black text-white hover:bg-black/90"
            asChild
          >
            <a href="#booking">Rent Now</a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CarsShowcase;
