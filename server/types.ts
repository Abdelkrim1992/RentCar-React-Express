// Custom type definitions for the application

export type User = {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
  fullName: string | null;
  email: string | null;
  createdAt: Date;
};

export type Booking = {
  id: number;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
  carId: number | null;
  userId: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
};

export type Car = {
  id: number;
  name: string;
  type: string;
  seats: number;
  power: string;
  rating: string;
  price: string;
  image: string;
  special: string | null;
  specialColor: string | null;
  description: string | null;
  features: string[];
  createdAt: Date;
};

export type SiteSettings = {
  id: number;
  siteName: string;
  logoColor: string;
  accentColor: string;
  logoText: string;
  customLogo: string | null;
  updatedAt: Date;
};

export namespace AppTypes {
  export type UserCreateInput = {
    username: string;
    password: string;
    isAdmin?: boolean;
    fullName?: string | null;
    email?: string | null;
  };
  
  export type BookingCreateInput = {
    pickupLocation: string;
    returnLocation: string;
    pickupDate: string;
    returnDate: string;
    carType: string;
    carId?: number | null;
    userId?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string;
  };
  
  export type CarCreateInput = {
    name: string;
    type: string;
    seats: number;
    power: string;
    rating: string;
    price: string;
    image: string;
    special?: string | null;
    specialColor?: string | null;
    description?: string | null;
    features: string[];
  };
  
  export type CarUpdateInput = {
    name?: string;
    type?: string;
    seats?: number;
    power?: string;
    rating?: string;
    price?: string;
    image?: string;
    special?: string | null;
    specialColor?: string | null;
    description?: string | null;
    features?: string[];
  };
  
  export type SiteSettingsUpdateInput = {
    siteName?: string;
    logoColor?: string;
    accentColor?: string;
    logoText?: string;
    customLogo?: string | null;
  };
}