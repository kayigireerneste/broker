import axios, { AxiosError } from 'axios';
import { SignupData, AuthResponse, OTPData, LoginData } from '@/types/auth';

const api = axios.create({
  // No need for full URL since we're calling our own Next.js API routes
  baseURL: '',  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log('Axios response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    // For auth endpoints, validate the response structure
    if (response.config.url?.includes('/auth/')) {
      console.log('Auth endpoint response:', response.data);
      if (response.data.error) {
        return Promise.reject(new Error(response.data.error));
      }
    }

    return response.data;

    return response.data;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      // The server responded with a status code outside 2xx
      const message = 
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error(error.message || 'Failed to make request'));
    }
  }
);

export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    return api.post('/auth/signup', data);
  },
  
  verifyOtp: async (data: OTPData): Promise<AuthResponse> => {
    return api.post('/auth/verify-otp', data);
  },
  
  resendOtp: async (email: string): Promise<{ message: string }> => {
    return api.post('/auth/resend-otp', { email });
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    return api.post('/auth/login', data);
  },
};

export default api;