export interface SignupData {
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

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    role: string;
    email: string;
    lastName: string;
  };
}

export interface OTPData {
  email: string;
  otp: string;
}

export interface LoginData {
  email: string;
  password: string;
}