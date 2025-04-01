import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart, 
  Car, 
  Calendar, 
  Settings, 
  Home, 
  LogOut, 
  User,
  Wrench
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Link href="/">
            <a className="font-turret text-2xl font-bold tracking-wider text-black">
              <span className="text-[#6843EC]">ETHER</span><span className="text-[#D2FF3A]">.</span>
              <span className="text-sm text-gray-500 ml-2">Admin</span>
            </a>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin" icon={<Home size={18} />} label="Dashboard" isActive={location === '/admin'} />
          <NavLink href="/admin/cars" icon={<Car size={18} />} label="Cars" isActive={location === '/admin/cars'} />
          <NavLink href="/admin/bookings" icon={<Calendar size={18} />} label="Bookings" isActive={location === '/admin/bookings'} />
          <NavLink href="/admin/stats" icon={<BarChart size={18} />} label="Statistics" isActive={location === '/admin/stats'} />
          <NavLink href="/admin/settings" icon={<Settings size={18} />} label="Settings" isActive={location === '/admin/settings'} />
          <NavLink href="/admin/profile" icon={<User size={18} />} label="Profile" isActive={location === '/admin/profile'} />
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              <span>Log Out</span>
            </Button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user ? user.username : 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user && user.isAdmin ? 'Administrator' : 'Staff'}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
        <Link href="/">
          <a className="font-turret text-2xl font-bold tracking-wider text-black">
            <span className="text-[#6843EC]">ETHER</span><span className="text-[#D2FF3A]">.</span>
          </a>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <Home size={20} />
            </Button>
          </Link>
          <Link href="/admin/cars">
            <Button variant="ghost" size="icon">
              <Car size={20} />
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, isActive }) => {
  return (
    <Link href={href}>
      <a className={`flex items-center px-3 py-2 rounded-md ${
        isActive 
          ? 'bg-[#6843EC]/10 text-[#6843EC]' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}>
        <span className="mr-2">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
};

export default AdminLayout;