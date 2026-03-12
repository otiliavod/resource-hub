export type Role = 'ADMIN' | 'MANAGER' | 'DEV';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type LoginRequest = { email: string; password: string };

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type RefreshResponse = { accessToken: string | null };

export type AuthActionResult = {
  success: boolean;
  message?: string;
};
