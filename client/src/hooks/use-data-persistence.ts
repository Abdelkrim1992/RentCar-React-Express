import { useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

// Key for localStorage
const STORAGE_KEY = 'ether_persistent_data';

interface PersistentData {
  bookings: any;
  cars: any;
  customers: any;
  timestamp: number;
}

/**
 * Hook to handle data persistence between page refreshes
 * @param key The API endpoint key
 * @param data The data to persist
 * @param maxAge Maximum age of cached data in milliseconds (default: 1 hour)
 */
export function usePersistData(key: string, data: any, maxAge: number = 60 * 60 * 1000) {
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data) {
      try {
        // Get existing data from storage
        const existingDataStr = localStorage.getItem(STORAGE_KEY);
        const existingData: PersistentData = existingDataStr 
          ? JSON.parse(existingDataStr) 
          : { bookings: null, cars: null, customers: null, timestamp: Date.now() };
        
        // Update the specific data for this key
        const updatedData = {
          ...existingData,
          [key.replace('/api/', '')]: data,
          timestamp: Date.now()
        };
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    }
  }, [key, data]);
  
  return null;
}

/**
 * Hook to restore persistent data
 * @param maxAge Maximum age of cached data in milliseconds (default: 1 hour)
 */
export function useRestoreData(maxAge: number = 60 * 60 * 1000) {
  const [isRestored, setIsRestored] = useState(false);
  
  useEffect(() => {
    try {
      const storedDataStr = localStorage.getItem(STORAGE_KEY);
      if (!storedDataStr) return;
      
      const storedData: PersistentData = JSON.parse(storedDataStr);
      const now = Date.now();
      
      // Check if data is still valid
      if (now - storedData.timestamp < maxAge) {
        // Restore data to query cache
        if (storedData.bookings) {
          queryClient.setQueryData(['/api/bookings'], { data: storedData.bookings });
        }
        
        if (storedData.cars) {
          queryClient.setQueryData(['/api/cars'], { data: storedData.cars });
        }
        
        if (storedData.customers) {
          queryClient.setQueryData(['/api/customers'], { data: storedData.customers });
        }
      } else {
        // Data is too old, clear it
        localStorage.removeItem(STORAGE_KEY);
      }
      
      setIsRestored(true);
    } catch (error) {
      console.error('Error restoring data from localStorage:', error);
      setIsRestored(true);
    }
  }, [maxAge]);
  
  return isRestored;
}

/**
 * Manually force save of current query data to localStorage
 */
export function forceDataPersistence() {
  try {
    const bookingsData = queryClient.getQueryData(['/api/bookings']);
    const carsData = queryClient.getQueryData(['/api/cars']);
    
    // Only extract the actual data from the response
    const extractedData = {
      bookings: bookingsData ? (bookingsData as any).data : null,
      cars: carsData ? (carsData as any).data : null,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extractedData));
    console.log('Data manually persisted to localStorage');
    return true;
  } catch (error) {
    console.error('Error manually persisting data:', error);
    return false;
  }
}

/**
 * Clear all persistent data from localStorage
 */
export function clearPersistentData() {
  localStorage.removeItem(STORAGE_KEY);
}