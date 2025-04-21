import { useEffect } from 'react';
import { useAppDispatch, useAppSelector, setBookings, setCars, setCustomers } from '@/lib/store';

/**
 * Hook for persisting data in Redux state
 * @param key The API endpoint key
 * @param data The data to persist
 */
export function useReduxPersist(key: string, data: any) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (!data) return;
    
    // Store data in Redux based on key path
    if (key === '/api/bookings') {
      dispatch(setBookings(data));
    } else if (key === '/api/cars') {
      dispatch(setCars(data));
    } else if (key === '/api/customers') {
      dispatch(setCustomers(data));
    }
  }, [key, data, dispatch]);
  
  return null;
}

/**
 * Hook to check if data in Redux is fresh or stale
 * @param key The API endpoint key
 * @param maxAge Maximum age of cached data in milliseconds (default: 5 minutes)
 */
export function useIsFreshData(key: string, maxAge: number = 5 * 60 * 1000): boolean {
  const lastFetched = useAppSelector(state => {
    if (key === '/api/bookings') {
      return state.booking.lastFetched.bookings;
    } else if (key === '/api/cars') {
      return state.booking.lastFetched.cars;
    } else if (key === '/api/customers') {
      return state.booking.lastFetched.customers;
    }
    return null;
  });
  
  // If we have a timestamp and it's within maxAge, data is fresh
  if (lastFetched) {
    return (Date.now() - lastFetched) < maxAge;
  }
  
  return false;
}

/**
 * Hook to get cached data from Redux
 * @param key The API endpoint key
 */
export function useReduxData(key: string): any {
  return useAppSelector(state => {
    if (key === '/api/bookings') {
      return state.booking.bookings;
    } else if (key === '/api/cars') {
      return state.booking.cars;
    } else if (key === '/api/customers') {
      return state.booking.customers;
    }
    return null;
  });
}