export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  idNumber: string;
  dateOfBirth: string;
  address: string;
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