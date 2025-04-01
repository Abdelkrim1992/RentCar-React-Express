import React from 'react';
import { Twitter, Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <a href="#" className="font-turret text-3xl font-bold tracking-wider mb-6 inline-block">
              <span className="text-[#6843EC]">ETHER</span><span className="text-[#D2FF3A]">.</span>
            </a>
            <p className="text-gray-400 mb-6">
              Experience unparalleled luxury and performance with our premium car rental service.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Twitter />} />
              <SocialIcon icon={<Facebook />} />
              <SocialIcon icon={<Instagram />} />
              <SocialIcon icon={<Youtube />} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-darker font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink label="About Us" />
              <FooterLink label="Our Fleet" />
              <FooterLink label="Locations" />
              <FooterLink label="Pricing" />
              <FooterLink label="FAQs" />
              <FooterLink label="Blog" />
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-darker font-bold mb-6">Contact</h3>
            <ul className="space-y-3">
              <ContactItem 
                icon={<MapPin className="h-5 w-5 mr-2 mt-0.5 text-[#D2FF3A]" />} 
                text="123 Business Avenue, Downtown, City" 
              />
              <ContactItem 
                icon={<Phone className="h-5 w-5 mr-2 mt-0.5 text-[#D2FF3A]" />} 
                text="+1 (555) 123-4567" 
              />
              <ContactItem 
                icon={<Mail className="h-5 w-5 mr-2 mt-0.5 text-[#D2FF3A]" />} 
                text="info@ethercarrental.com" 
              />
              <ContactItem 
                icon={<Clock className="h-5 w-5 mr-2 mt-0.5 text-[#D2FF3A]" />} 
                text={<>Mon-Fri: 8AM - 8PM<br />Sat-Sun: 9AM - 6PM</>} 
              />
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-darker font-bold mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to receive updates on new cars and special offers.</p>
            <form className="space-y-4">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6843EC] focus:outline-none" 
              />
              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-[#6843EC] to-[#D2FF3A] hover:from-[#5733dc] hover:to-[#c2ef2a] text-white font-semibold"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">© 2023 Ether Car Rental. All rights reserved.</p>
            <div className="flex space-x-6">
              <FooterLink label="Privacy Policy" color="text-gray-500" />
              <FooterLink label="Terms of Service" color="text-gray-500" />
              <FooterLink label="Cookie Policy" color="text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  icon: React.ReactNode;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon }) => {
  return (
    <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-[#6843EC] transition-colors">
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  label: string;
  color?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ label, color = "text-gray-400" }) => {
  return (
    <li>
      <a href="#" className={`${color} hover:text-white transition-colors`}>
        {label}
      </a>
    </li>
  );
};

interface ContactItemProps {
  icon: React.ReactNode;
  text: React.ReactNode;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text }) => {
  return (
    <li className="flex items-start">
      {icon}
      <span className="text-gray-400">{text}</span>
    </li>
  );
};

export default Footer;
