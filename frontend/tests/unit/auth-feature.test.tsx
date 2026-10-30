import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { authApi } from "@/features/auth/api/auth.api";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { apiClient } from "@/lib/api/client";

describe("features/auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("authApi", () => {
    it("calls apiClient.post with login credentials", async () => {
      const mockTokens = {
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
      };
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue(mockTokens);

      const result = await authApi.login({
        email: "admin@pjjewellery.com",
        password: "SecretPassword123!",
      });

      expect(postSpy).toHaveBeenCalledWith("/api/v1/auth/login", {
        email: "admin@pjjewellery.com",
        password: "SecretPassword123!",
      });
      expect(result).toEqual(mockTokens);
    });

    it("calls apiClient.post with refresh token", async () => {
      const mockTokens = {
        access_token: "new-access-token",
        token_type: "bearer",
        expires_in: 3600,
      };
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue(mockTokens);

      const result = await authApi.refreshToken("mock-refresh-token");

      expect(postSpy).toHaveBeenCalledWith("/api/v1/auth/refresh", {
        refresh_token: "mock-refresh-token",
      });
      expect(result).toEqual(mockTokens);
    });

    it("calls apiClient.get for profile with token", async () => {
      const mockProfile = {
        id: "usr_123",
        email: "admin@pjjewellery.com",
        full_name: "Master Jeweller",
      };
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue(mockProfile);

      const result = await authApi.getProfile("valid-token");

      expect(getSpy).toHaveBeenCalledWith("/api/v1/auth/me", {
        token: "valid-token",
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe("useAuth & AuthProvider", () => {
    it("throws when useAuth is consumed outside AuthProvider", () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");
    });

    it("provides initial unauthenticated state within AuthProvider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("updates auth state on successful login and resets on logout", async () => {
      const mockTokens = {
        access_token: "jwt-token-123",
        token_type: "bearer",
        expires_in: 3600,
      };
      vi.spyOn(authApi, "login").mockResolvedValue(mockTokens);
      vi.spyOn(authApi, "getProfile").mockResolvedValue({
        id: "mock-admin-id",
        email: "admin@pjjewellery.com",
        full_name: "Admin User",
        role: "super_admin",
        is_active: true,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          email: "admin@pjjewellery.com",
          password: "SecretPassword123!",
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.tokens?.access_token).toBe("jwt-token-123");

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.tokens).toBeNull();
    });
  });
});
