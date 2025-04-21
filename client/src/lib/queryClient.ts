import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('ether_auth_token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  customHeaders?: Record<string, string>
): Promise<T> {
  // Set up headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...customHeaders
  };

  // Add authorization token if available
  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  const jsonData = await res.json();
  return jsonData as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepare headers
    const headers: Record<string, string> = {};
    
    try {
      // Add authorization token if available in localStorage
      // Direct localStorage access ensures we always have the latest token
      const token = localStorage.getItem('ether_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // Fallback to regular function if localStorage is not available
      console.error('Error accessing localStorage:', error);
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Function to persist cache to localStorage
const persistCache = (cache: any) => {
  try {
    localStorage.setItem('ether_query_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Error persisting cache to localStorage:', error);
  }
};

// Function to load cache from localStorage
const loadCache = (): any => {
  try {
    const cachedData = localStorage.getItem('ether_query_cache');
    return cachedData ? JSON.parse(cachedData) : {};
  } catch (error) {
    console.error('Error loading cache from localStorage:', error);
    return {};
  }
};

// Create query client with persistence
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetching when window is focused
      staleTime: 5 * 60 * 1000, // Set data to be stale after 5 minutes
      gcTime: 10 * 60 * 1000, // Cache data for 10 minutes (gcTime replaces cacheTime in React Query v5)
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

// Initialize with any cached data from localStorage
try {
  const cachedData = loadCache();
  if (cachedData && Object.keys(cachedData).length > 0) {
    queryClient.setQueryData(['/api/bookings'], cachedData['/api/bookings']);
    queryClient.setQueryData(['/api/cars'], cachedData['/api/cars']);
  }
} catch (error) {
  console.error('Error initializing cache:', error);
}

// Set up event listeners to persist cache
window.addEventListener('beforeunload', () => {
  const bookingsData = queryClient.getQueryData(['/api/bookings']);
  const carsData = queryClient.getQueryData(['/api/cars']);
  
  const cacheToStore = {
    '/api/bookings': bookingsData,
    '/api/cars': carsData
  };
  
  persistCache(cacheToStore);
});
