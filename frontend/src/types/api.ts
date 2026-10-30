/**
 * API request, response, and pagination contracts.
 */
import type { User } from "./models";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "live" | "ready" | "not_ready";
  service?: string;
  environment?: string;
  database?: "connected" | "disconnected";
  timestamp?: string;
  version?: string;
}

export type CurrentUserResponse = User;
