import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
    // If environment variable is set, use it
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
      return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
  
    // Development defaults
    if (__DEV__) {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3001/api/v1';
      }
      // iOS simulator can use localhost
      if (Platform.OS === 'ios') {
        return 'http://localhost:3001/api/v1';
      }
    }
  
    // Production fallback
    return 'https://your-production-api.com/api/v1';
  };
  
  const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeTokens();
  }

  private async initializeTokens() {
    try {
      this.accessToken = await AsyncStorage.getItem("access_token");
      this.refreshToken = await AsyncStorage.getItem("refresh_token");
    } catch (error) {
      console.error("Failed to load tokens:", error);
    }
  }

  async setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    try {
      await AsyncStorage.setItem("access_token", accessToken);
      await AsyncStorage.setItem("refresh_token", refreshToken);
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    try {
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      await this.setTokens(data.access_token, this.refreshToken);

      return data.access_token;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // If token expired and we have a refresh token
      if (response.status === 401 && this.refreshToken) {
        if (this.isRefreshing) {
          // If already refreshing, wait for it to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(async () => {
            // Retry the original request
            const newHeaders = { ...headers };
            if (this.accessToken) {
              newHeaders.Authorization = `Bearer ${this.accessToken}`;
            }
            const retryResponse = await fetch(url, { ...config, headers: newHeaders });
            
            if (!retryResponse.ok) {
              const error = await retryResponse
                .json()
                .catch(() => ({ message: "An error occurred" }));
              throw new Error(error.message || `HTTP ${retryResponse.status}`);
            }
            
            return retryResponse.json();
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.processQueue(null, newToken);

          // Retry the original request with new token
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...config, headers });

          if (!retryResponse.ok) {
            const error = await retryResponse
              .json()
              .catch(() => ({ message: "An error occurred" }));
            throw new Error(error.message || `HTTP ${retryResponse.status}`);
          }

          return retryResponse.json();
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          await this.clearTokens();
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "An error occurred" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        )}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);