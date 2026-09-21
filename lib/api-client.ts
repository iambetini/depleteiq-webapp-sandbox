import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth/next";
import { getSession, signOut } from "next-auth/react";
import { authOptions } from "./auth";
import { showError } from "./notifications";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

// Types
export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data: T;
  errors: Array<{ field: string; message: string }>;
  meta: {
    pagination?: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  showToast?: boolean;
}

// Error handling utilities
const createError = (message: string, errors?: any[]): Error => {
  const error = new Error(message) as any;
  if (Array.isArray(errors)) {
    error.errors = errors;
  }
  return error;
};

const formatErrorMessages = (errors: any[]): string => {
  return errors
    .map((err) => (typeof err === "string" ? err : err?.message || ""))
    .filter(Boolean)
    .join("\n");
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private cachedToken: string | null = null;
  private tokenObtainedAt: number | null = null;
  private tokenExpiresIn: number | null = null;
  private sessionPromise: Promise<any> | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = this.createAxiosInstance(baseURL);
    this.setupInterceptors();
  }

  private createAxiosInstance(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(this.handleRequest.bind(this));
    this.axiosInstance.interceptors.response.use(
      this.handleSuccessResponse.bind(this),
      this.handleErrorResponse.bind(this),
    );
  }

  private async handleRequest(config: any): Promise<any> {
    const timeUntilExpiry = this.getTimeUntilExpiry();

    // Proactive refresh if token expires within 5 minutes
    if (timeUntilExpiry !== null && timeUntilExpiry < REFRESH_BUFFER_MS) {
      await this.refreshAccessToken();
    }

    const token = await this.getValidToken();

    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Handle FormData - remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  }

  private handleSuccessResponse(response: any): any {
    if (response.data?.status === "success") {
      return response.data;
    }

    return this.createErrorFromResponse(response);
  }

  private async handleErrorResponse(error: any): Promise<never> {
    const message = this.extractErrorMessage(error);

    if (message === "Unauthenticated.") {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.axiosInstance.request(error.config);
      }
      this.clearCache();
      signOut();
    }

    const config = (error.config || {}) as ApiRequestConfig;
    this.showErrorIfNeeded(config, error.response?.data?.errors, message);

    return Promise.reject(createError(message, error.response?.data?.errors));
  }

  private createErrorFromResponse(response: any): Promise<never> {
    const message = response.data?.message || "API returned an error status";
    const errors = response.data?.errors;
    const config = response.config as ApiRequestConfig;

    this.showErrorIfNeeded(config, errors, message);

    return Promise.reject(createError(message, errors));
  }

  private extractErrorMessage(error: any): string {
    return (
      error.response?.data?.message ||
      (error.request ? "No response from server" : error.message) ||
      "An error occurred"
    );
  }

  private showErrorIfNeeded(
    config: ApiRequestConfig,
    errors: any,
    message: string,
  ): void {
    const showToast = config.showToast !== false;
    if (!showToast) return;

    // Only show toast on client side
    if (typeof window === "undefined") return;

    if (Array.isArray(errors) && errors.length > 0) {
      showError(formatErrorMessages(errors), "Error");
    } else {
      showError(message, "Error");
    }
  }

  // --- Token management ---

  private getTimeUntilExpiry(): number | null {
    if (!this.tokenObtainedAt || !this.tokenExpiresIn) return null;
    const expiryMs = this.tokenObtainedAt + this.tokenExpiresIn * 1000;
    return expiryMs - Date.now();
  }

  private async getRefreshTokenFromSession(): Promise<string | null> {
    try {
      const session = await this.createSessionRequest();
      return session?.refresh_token || null;
    } catch {
      return null;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const refresh_token = await this.getRefreshTokenFromSession();
        if (!refresh_token) return false;

        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data.status !== "success") return false;

        const { token, refresh_token: new_refresh_token, expires_in } =
          data.data;

        this.cachedToken = token;
        this.tokenObtainedAt = Date.now();
        this.tokenExpiresIn = expires_in;

        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private clearCache(): void {
    this.cachedToken = null;
    this.tokenObtainedAt = null;
    this.tokenExpiresIn = null;
    this.sessionPromise = null;
  }

  private async getValidToken(): Promise<string | null> {
    // Return cached token if still valid (> 5 minutes remaining)
    const timeUntilExpiry = this.getTimeUntilExpiry();
    if (this.cachedToken && timeUntilExpiry !== null && timeUntilExpiry > REFRESH_BUFFER_MS) {
      return this.cachedToken;
    }

    // Wait for existing session request
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      if (session?.accessToken) {
        this.cachedToken = session.accessToken;
        this.tokenObtainedAt = session.token_obtained_at || null;
        this.tokenExpiresIn = session.expires_in || null;
      }
      return session?.accessToken || null;
    }

    // Create new session request
    this.sessionPromise = this.createSessionRequest();

    try {
      const session = await this.sessionPromise;
      const token = session?.accessToken || null;

      if (token) {
        this.cachedToken = token;
        this.tokenObtainedAt = session.token_obtained_at || Date.now();
        this.tokenExpiresIn = session.expires_in || null;
      }

      return token;
    } finally {
      this.sessionPromise = null;
    }
  }

  private createSessionRequest(): Promise<any> {
    return typeof window === "undefined"
      ? getServerSession(authOptions)
      : getSession();
  }

  // --- Public API ---

  private mergeConfig(config?: ApiRequestConfig): ApiRequestConfig {
    return { showToast: true, ...config };
  }

  private async makeRequest<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const mergedConfig = this.mergeConfig(config);
    if (method === "get" || method === "delete") {
      return await this.axiosInstance[method](endpoint, mergedConfig);
    } else {
      return await this.axiosInstance[method](endpoint, data, mergedConfig);
    }
  }

  async get<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("get", endpoint, undefined, config);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("post", endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("put", endpoint, data, config);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("patch", endpoint, data, config);
  }

  async delete<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("delete", endpoint, undefined, config);
  }
}

export const apiClient = new ApiClient(`${API_BASE_URL}/api/v1`);
