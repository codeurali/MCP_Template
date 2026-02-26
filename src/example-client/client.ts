import type { Config } from "../config/config.schema.js";
import type { AuthProvider } from "../auth/auth-provider.interface.js";

export interface Thing {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
}

export interface ListThingsParams {
  filter?: string;
  top: number;
}

export class NotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly details: string;

  public constructor(status: number, details: string) {
    super(`Request failed with status ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

export class ExampleApiClient {
  private readonly config: Config;
  private readonly authProvider: AuthProvider;

  public constructor(config: Config, authProvider: AuthProvider) {
    this.config = config;
    this.authProvider = authProvider;
  }

  public async getThing(id: string, fields?: string[]): Promise<Thing> {
    const searchParams = new URLSearchParams();
    if (fields && fields.length > 0) {
      searchParams.set("fields", fields.join(","));
    }

    const query = searchParams.toString();
    const path = query ? `/things/${id}?${query}` : `/things/${id}`;

    return this.request<Thing>(path, { method: "GET" });
  }

  public async listThings(params: ListThingsParams): Promise<Thing[]> {
    const searchParams = new URLSearchParams();
    if (params.filter) {
      searchParams.set("filter", params.filter);
    }
    searchParams.set("top", String(params.top));

    return this.request<Thing[]>(`/things?${searchParams.toString()}`, {
      method: "GET"
    });
  }

  public async deleteThing(id: string): Promise<void> {
    await this.request<void>(`/things/${id}`, { method: "DELETE" });
  }

  private async request<T>(path: string, init: RequestInit, attempt = 0): Promise<T> {
    const token = await this.authProvider.getAccessToken();
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          ...(init.headers ?? {})
        },
        signal: controller.signal
      });

      if (response.status === 404) {
        throw new NotFoundError(`Resource not found at path: ${path}`);
      }

      if (!response.ok) {
        const details = await response.text();
        if (this.shouldRetry(response.status) && attempt < this.config.maxRetries) {
          await this.sleep(this.getBackoffDelay(attempt));
          return this.request<T>(path, init, attempt + 1);
        }

        throw new ApiRequestError(response.status, details);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      const isRetryableNetworkError = error instanceof TypeError;

      if ((isAbort || isRetryableNetworkError) && attempt < this.config.maxRetries) {
        await this.sleep(this.getBackoffDelay(attempt));
        return this.request<T>(path, init, attempt + 1);
      }

      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private shouldRetry(statusCode: number): boolean {
    return [429, 500, 502, 503, 504].includes(statusCode);
  }

  private getBackoffDelay(attempt: number): number {
    const base = 250;
    return base * Math.pow(2, attempt);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
