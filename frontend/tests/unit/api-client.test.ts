import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api/client";

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles successful GET request returning parsed JSON", async () => {
    const mockData = { status: "live", service: "PJ Backend" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      })
    );

    const result = await apiClient.get<typeof mockData>("/api/v1/health/live");
    expect(result).toEqual(mockData);
  });

  it("translates non-2xx response into ApiError with backend error message", async () => {
    const backendError = {
      error: {
        code: "UNAUTHORIZED",
        message: "Incorrect email or password",
        details: [],
      },
      request_id: "req-12345",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => backendError,
        headers: new Headers({ "X-Request-ID": "req-12345" }),
      })
    );

    await expect(apiClient.post("/api/v1/auth/login", {})).rejects.toThrow(
      "Incorrect email or password"
    );
  });

  it("attaches Authorization header when token is supplied", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "user-123" }),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.get("/api/v1/auth/me", { token: "test-jwt-token" });

    expect(fetchMock).toHaveBeenCalled();
    const callArgs = fetchMock.mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-jwt-token");
  });
});
