/**
 * Represents structured field-level error details returned from the backend.
 */
export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

/**
 * Standard error response envelope from PJ Backend.
 */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  request_id?: string;
}

/**
 * Custom application error class for handling API failures.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: ApiErrorDetail[];
  public readonly requestId?: string;

  constructor(status: number, message: string, code = "UNKNOWN_ERROR", details: ApiErrorDetail[] = [], requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  /**
   * Safe parser to extract ApiError from a raw fetch response.
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    const status = response.status;
    let message = `Request failed with status ${status}`;
    let code = "HTTP_ERROR";
    let details: ApiErrorDetail[] = [];
    let requestId = response.headers.get("X-Request-ID") || undefined;

    try {
      const data = (await response.json()) as Partial<ApiErrorEnvelope>;
      if (data && data.error) {
        message = data.error.message || message;
        code = data.error.code || code;
        details = data.error.details || [];
        requestId = data.request_id || requestId;
      }
    } catch {
      // Body was not JSON; use default status message
    }

    return new ApiError(status, message, code, details, requestId);
  }
}
