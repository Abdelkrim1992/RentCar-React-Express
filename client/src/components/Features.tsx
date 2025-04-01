import React from 'react';
import { Clock, Shield, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h5 className="font-darker font-semibold text-[#6843EC] mb-2">WHY CHOOSE US</h5>
            <h2 className="font-darker font-bold text-4xl md:text-5xl mb-6">Experience the Ether Advantage</h2>
            <p className="font-work text-gray-700 mb-10 max-w-xl">
              We've reimagined the car rental experience from the ground up. From our seamless booking process to our exceptional service, every detail is designed with you in mind.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard 
                icon={<Clock className="h-6 w-6" />} 
                title="Instant Booking" 
                description="Reserve your dream car in under 2 minutes with our streamlined process."
                bgColor="bg-[#6843EC]"
              />
              
              <FeatureCard 
                icon={<Shield className="h-6 w-6" />} 
                title="Full Insurance" 
                description="Comprehensive coverage included with every rental for peace of mind."
                bgColor="bg-[#D2FF3A]"
                textColor="text-black"
              />
              
              <FeatureCard 
                icon={<Check className="h-6 w-6" />} 
                title="No Hidden Fees" 
                description="Transparent pricing with all costs clearly displayed upfront."
                bgColor="bg-black"
              />
              
              <FeatureCard 
                icon={<Zap className="h-6 w-6" />} 
                title="24/7 Support" 
                description="Expert assistance available around the clock whenever you need it."
                bgColor="bg-gradient-to-r from-[#6843EC] to-[#8F6FFF]"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full bg-[#D2FF3A]/15 blur-[100px] z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=900&q=80" 
              className="w-full rounded-3xl shadow-lg relative z-10" 
              alt="Luxury Car Interior" 
            />
            
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-lg max-w-xs z-20">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-darker font-bold text-xl">Customer Satisfaction</h4>
                <div className="p-2 rounded-xl bg-[#D2FF3A]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <SatisfactionBar label="Service Quality" value={95} />
                <SatisfactionBar label="Vehicle Condition" value={98} />
                <SatisfactionBar label="Booking Experience" value={92} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  textColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, bgColor, textColor = "text-white" }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className={`p-3 ${bgColor} rounded-xl ${textColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-darker font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

interface SatisfactionBarProps {
  label: string;
  value: number;
}

const SatisfactionBar: React.FC<SatisfactionBarProps> = ({ label, value }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span>{label}</span>
        <Progress value={value} className="w-32 h-2 bg-gray-200" indicatorClassName="bg-[#6843EC]" />
      </div>
    </div>
  );
};

export default Features;
