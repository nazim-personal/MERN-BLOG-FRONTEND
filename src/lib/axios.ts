import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { apiCache } from './api-cache';

// Extend AxiosRequestConfig to include custom properties
declare module 'axios' {
    export interface AxiosRequestConfig {
        cache?: boolean;
        ttl?: number;
    }
}

const instance = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request deduplication map - to be implemented fully later
// const pendingRequests = new Map<string, Promise<AxiosResponse<unknown>>>();

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Check cache for GET requests
        if (config.method === 'get' && config.cache !== false) {
            const cacheKey = config.url + JSON.stringify(config.params);
            const cachedResponse = apiCache.get(cacheKey);

            if (cachedResponse) {
                // Return cached response using a special adapter or by throwing a specific error that we catch
                // But simpler is to attach it to the config and handle in response interceptor?
                // Axios doesn't easily support returning from request interceptor.
                // A common pattern is to use a custom adapter, but that's complex.
                // For now, we will implement deduplication here and basic caching logic in the calling components
                // OR we can wrap the axios call.
                // Actually, let's keep it simple: we won't force cache in interceptor for now to avoid complexity
                // with cancelling requests. We'll use the apiCache utility explicitly in components where needed.
                // BUT, we can implement request deduplication here.
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
            // Handle 401 Unauthorized
            try {
                // Call logout endpoint to clear cookies
                await axios.post('/auth/logout');

                // Redirect to signin
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
                    window.location.href = '/signin';
                    toast.error('Session expired. Please sign in again.');
                }
            } catch (logoutError) {
                console.error('Logout failed during 401 handling:', logoutError);
            }
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action');
        } else if (error.response?.status === 500) {
            // Only show generic error for 500s if not handled locally
            // toast.error('Internal Server Error');
        }

        // Always reject the error so calling code can handle it (e.g., stop loading state)
        // But we return a rejected promise with a specific structure if needed
        return Promise.reject(error);
    }
);

export default instance;
