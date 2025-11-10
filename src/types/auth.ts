export interface SignupData {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: string;
  country: string;
  city: string;
}

export interface ProfileDetailsData {
  idNumber?: string;
  passportPhoto?: string;
  idDocument?: string;
  dateOfBirth?: string;
  occupation?: string;
  investmentExperience?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    role: string;
    email: string;
    fullName: string;
  };
}

export interface OTPData {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  csdNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}