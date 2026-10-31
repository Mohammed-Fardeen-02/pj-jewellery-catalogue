"use client";

import * as React from "react";
import type { AuthState, AuthTokens, LoginFormData, UserProfile } from "../types/auth.types";
import { authApi } from "../api/auth.api";

export const STORAGE_KEY_TOKENS = "pj_auth_tokens";
export const STORAGE_KEY_USER = "pj_auth_user";

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginFormData) => Promise<AuthTokens>;
  logout: () => void;
  refreshToken: () => Promise<AuthTokens | null>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = React.useState<AuthTokens | null>(null);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Sync session & verify active profile on initial mount
  React.useEffect(() => {
    let activeTokens: AuthTokens | null = null;
    try {
      const savedTokens = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (savedTokens) {
        activeTokens = JSON.parse(savedTokens);
        setTokens(activeTokens);
      }
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Ignore localStorage errors
    }

    async function restoreSession() {
      if (!activeTokens?.access_token) return;

      try {
        const profile = await authApi.getProfile(activeTokens.access_token);
        setUser(profile);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      } catch (err) {
        // If access token is expired, attempt token refresh with refresh_token
        if (activeTokens.refresh_token) {
          try {
            const refreshed = await authApi.refreshToken(activeTokens.refresh_token);
            setTokens(refreshed);
            localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(refreshed));
            const profile = await authApi.getProfile(refreshed.access_token);
            setUser(profile);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
            return;
          } catch {
            // Refresh failed: session really expired
          }
        }
        // Session invalid: clear stored credentials
        setTokens(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_TOKENS);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }

    restoreSession();
  }, []);

  const login = React.useCallback(async (credentials: LoginFormData): Promise<AuthTokens> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setTokens(response);
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(response));

      try {
        const profile = await authApi.getProfile(response.access_token);
        setUser(profile);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      } catch (profileErr) {
        console.warn("Could not fetch user profile immediately upon login", profileErr);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    setTokens(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_TOKENS);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, []);

  const refreshToken = React.useCallback(async (): Promise<AuthTokens | null> => {
    if (!tokens?.refresh_token) return null;
    try {
      const refreshed = await authApi.refreshToken(tokens.refresh_token);
      setTokens(refreshed);
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(refreshed));
      return refreshed;
    } catch {
      logout();
      return null;
    }
  }, [tokens, logout]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      tokens,
      user,
      isAuthenticated: !!tokens?.access_token,
      isLoading,
      login,
      logout,
      refreshToken,
    }),
    [tokens, user, isLoading, login, logout, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
