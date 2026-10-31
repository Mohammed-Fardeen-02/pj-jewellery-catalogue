import { API_BASE_URL } from "./endpoints";
import { ApiError } from "./errors";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string | null;
  timeoutMs?: number;
  body?: unknown;
}

/**
 * Standard typed HTTP client communicating with PJ FastAPI backend.
 */
class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Internal request executor.
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      token,
      timeoutMs = 15000,
      headers: customHeaders,
      body,
      signal: customSignal,
      ...fetchOptions
    } = options;

    // Build URL with optional query parameters
    const url = new URL(endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Compose headers
    const headers = new Headers(customHeaders);
    headers.set("Accept", "application/json");

    if (body !== undefined && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const resolvedToken =
      token ||
      (typeof window !== "undefined"
        ? (() => {
            try {
              const saved = localStorage.getItem("pj_auth_tokens");
              return saved ? JSON.parse(saved)?.access_token : null;
            } catch {
              return null;
            }
          })()
        : null);

    if (resolvedToken) {
      headers.set("Authorization", `Bearer ${resolvedToken}`);
    }

    // Set up timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Chain custom abort signal if provided
    if (customSignal) {
      customSignal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(url.toString(), {
        cache: fetchOptions.cache || "no-store",
        ...fetchOptions,
        headers,
        signal: controller.signal,
        body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : (body as BodyInit),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await ApiError.fromResponse(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(408, "Request timed out or was cancelled", "TIMEOUT");
      }

      throw new ApiError(
        0,
        error instanceof Error ? error.message : "Network error. Please check your connection.",
        "NETWORK_ERROR"
      );
    }
  }

  public get<T>(endpoint: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
