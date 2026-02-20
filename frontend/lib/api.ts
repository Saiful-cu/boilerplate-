import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

// Create axios instance with default config
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                isNetworkError: true
            });
        }

        const { status, data } = error.response as AxiosResponse;

        // Handle authentication errors
        if (status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        // Handle rate limiting
        if (status === 429) {
            console.warn('Rate limited:', (data as any)?.message);
        }

        // Handle server errors
        if (status >= 500) {
            console.error('Server error:', (data as any)?.message || 'Internal server error');
        }

        return Promise.reject(error);
    }
);

// Helper function to get full image/asset URL
export const getAssetUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // For static assets served by Next.js (starting with /), always return as-is
    // These should be served from the current domain, not the API server
    if (path.startsWith('/')) return path;

    // For other assets (uploaded files), handle differently for client vs server
    if (typeof window !== 'undefined') {
        // In browser, construct relative URL
        return `/${path}`;
    }

    // On server (SSR), return absolute URL to API server for uploaded assets
    return `${SERVER_BASE_URL}/${path}`;
};

// Helper to get API URL without needing axios instance
export const getApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Retry logic for failed requests
export const apiWithRetry = async <T>(
    requestFn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFn();
        } catch (error: any) {
            if (i === retries - 1) throw error;
            if (error.response?.status >= 500 || error.isNetworkError) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries reached');
};

export { API_BASE_URL, SERVER_BASE_URL };
export default api;
