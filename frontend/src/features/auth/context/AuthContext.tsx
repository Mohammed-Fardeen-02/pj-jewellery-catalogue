"use client";

import * as React from "react";
import type { AuthState, AuthTokens, LoginFormData, UserProfile } from "../types/auth.types";
import { authApi } from "../api/auth.api";

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginFormData) => Promise<AuthTokens>;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = React.useState<AuthTokens | null>(null);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const login = React.useCallback(async (credentials: LoginFormData): Promise<AuthTokens> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setTokens(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    setTokens(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      tokens,
      user,
      isAuthenticated: !!tokens?.access_token,
      isLoading,
      login,
      logout,
    }),
    [tokens, user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
