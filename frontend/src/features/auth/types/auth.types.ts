import type { LoginFormData } from "../schemas/auth.schema";

export type { LoginFormData };

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role?: string;
  is_active?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
