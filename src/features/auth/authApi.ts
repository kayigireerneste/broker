import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  idNumber: string;
  dateOfBirth: string;
  country: string;
  city: string;
  occupation: string;
  investmentExperience: string;
}

interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  message: string;
  verified: boolean;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/auth',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (credentials) => ({
        url: '/signup',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: '/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useVerifyOTPMutation,
} = authApi;
