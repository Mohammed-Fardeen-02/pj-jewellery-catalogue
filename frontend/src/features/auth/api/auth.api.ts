import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthTokens, LoginFormData, UserProfile } from "../types/auth.types";

/**
 * Authentication Feature API Service
 * Centralizes all direct HTTP calls related to authentication.
 */
export const authApi = {
  /**
   * Authenticate administrator with email and password
   */
  async login(credentials: LoginFormData): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(ENDPOINTS.auth.login, credentials);
  },

  /**
   * Refresh JWT access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });
  },

  /**
   * Fetch current authenticated administrator profile
   */
  async getProfile(token?: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(ENDPOINTS.auth.me, { token });
  },
};
