import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TestimonialProps {
  name: string;
  image: string;
  comment: string;
  car: string;
  delay: number;
}

const testimonials: TestimonialProps[] = [
  {
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    comment: "The Tesla Model S I rented was impeccable. The booking process was incredibly smooth, and the car was delivered right to my hotel. I couldn't have asked for a better experience!",
    car: "Tesla Model S",
    delay: 0.1
  },
  {
    name: "Michael Cooper",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    comment: "Driving the AMG GT was the highlight of my vacation. The car was pristine, and the staff was professional and courteous. I'll definitely be using Ether again for my next trip!",
    car: "Mercedes AMG GT",
    delay: 0.2
  },
  {
    name: "Rebecca Chen",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    comment: "We needed a spacious SUV for our family trip and the Range Rover was perfect. The car was clean, comfortable, and the customer service team went above and beyond to accommodate our needs.",
    car: "Range Rover Sport",
    delay: 0.3
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h5 className="font-darker font-semibold text-[#6843EC] mb-2">CUSTOMER EXPERIENCES</h5>
          <h2 className="font-darker font-bold text-4xl md:text-5xl mb-6">What Our Clients Say</h2>
          <p className="font-work text-gray-700">
            Don't just take our word for it. Here's what our customers have to say about their experience with Ether.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button className="px-8 py-6 bg-[#6843EC] hover:bg-[#6843EC]/90 text-white font-semibold">
            Read More Reviews
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<TestimonialProps> = ({ name, image, comment, car, delay }) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-14 h-14">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-darker font-bold text-xl">{name}</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-700 mb-4">
        "{comment}"
      </p>
      <p className="text-[#6843EC] font-medium">Rented: {car}</p>
    </motion.div>
  );
};

export default Testimonials;
