import { useAuthStore } from './store';

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  data?: any;
  requireAuth?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Internal variable to prevent infinite refresh loops
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, requireAuth = true, ...customConfig } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customConfig.headers as Record<string, string>),
  };

  const store = useAuthStore.getState();

  if (requireAuth && store.accessToken) {
    headers['Authorization'] = `Bearer ${store.accessToken}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (data instanceof FormData) {
    // If it's FormData, let the browser set the Content-Type automatically with the correct boundary
    const headersObj = config.headers as Record<string, string>;
    delete headersObj['Content-Type'];
    delete headersObj['content-type'];
    config.body = data;
  } else if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_URL}${endpoint}`;
  let response = await fetch(url, config);

  // If 401 Unauthorized, attempt a silent refresh
  if (response.status === 401 && requireAuth) {
    try {
      const newToken = await handleTokenRefresh();
      
      // Retry the original request with the new token
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      response = await fetch(url, {
        ...config,
        headers: retryHeaders
      });
      
    } catch (error) {
      // Refresh failed, logout the user
      store.logout();
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
  }

  // Parse standard envelope response
  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    responseData = null;
  }

  if (!response.ok) {
    const errorObj = responseData?.error;
    const errorMessage = 
      responseData?.message || 
      (typeof errorObj === 'string' ? errorObj : errorObj?.message) || 
      response.statusText || 
      'An unexpected error occurred';
      
    throw new ApiError(response.status, errorMessage, responseData);
  }

  return responseData as T;
}

/**
 * Handles the logic of refreshing the access token.
 * Prevents multiple simultaneous refresh requests.
 */
async function handleTokenRefresh(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = new Promise(async (resolve, reject) => {
    try {
      // Ensure credentials (cookies) are sent so the backend can read the HTTP-only refresh token cookie
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      
      // Assume the backend returns { success: true, data: { accessToken: '...' } }
      const newAccessToken = data?.data?.accessToken || data?.accessToken;
      
      if (!newAccessToken) {
        throw new Error('No access token returned');
      }

      // Update the Zustand store with the new token
      useAuthStore.getState().setAccessToken(newAccessToken);
      
      resolve(newAccessToken);
    } catch (error) {
      reject(error);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  });

  return refreshPromise;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'POST', data }),
    
  put: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'PUT', data }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
    
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', data }),
};
