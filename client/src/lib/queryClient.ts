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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
