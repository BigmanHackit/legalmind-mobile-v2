import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from "./client";
import {
  LoginDto,
  RegisterDto,
  User,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
} from "../types";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  canLogin: boolean;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export const authApi = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    await apiClient.setTokens(response.access_token, response.refresh_token);

    // Store user data separately
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(response.user));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }

    return response;
  },

  async register(userData: RegisterDto): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/auth/register", userData);
  },

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto
  ): Promise<EmailVerificationResponse> {
    return apiClient.post<EmailVerificationResponse>(
      "/auth/verify-email",
      verifyEmailDto
    );
  },

  async resendVerification(
    resendDto: ResendVerificationDto
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      "/auth/resend-verification",
      resendDto
    );
  },

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      forgotPasswordDto
    );
  },

  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      "/auth/reset-password",
      resetPasswordDto
    );
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/auth/profile");

    // Update stored user data
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(response));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }

    return response;
  },

  async logout(refreshToken?: string): Promise<{ message: string }> {
    const tokenToUse = refreshToken || apiClient.getRefreshToken();

    try {
      const logoutData = tokenToUse ? { refresh_token: tokenToUse } : {};
      const response = await apiClient.post<{ message: string }>(
        "/auth/logout",
        logoutData
      );
      return response;
    } finally {
      // Clear tokens regardless of API response
      await apiClient.clearTokens();
      try {
        await AsyncStorage.removeItem("user_data");
      } catch (error) {
        console.error("Failed to clear user data:", error);
      }
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = apiClient.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      {
        refresh_token: refreshToken,
      }
    );

    // Update stored access token (keep same refresh token)
    await apiClient.setTokens(response.access_token, refreshToken);

    return response;
  },

  async validateToken(token: string): Promise<{
    valid: boolean;
    user?: User;
    exp?: number;
  }> {
    return apiClient.post("/auth/validate-token", { token });
  },

  async revokeRefreshToken(token: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/revoke-token/${token}`);
  },

  async revokeAllTokens(): Promise<{ message: string; count: number }> {
    const response = await apiClient.delete<{ message: string; count: number }>(
      "/auth/revoke-all-tokens"
    );
    // Force logout after revoking all tokens
    await apiClient.clearTokens();
    try {
      await AsyncStorage.removeItem("user_data");
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
    return response;
  },

  // Helper methods for client-side auth state
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  async isEmailVerified(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isEmailVerified ?? false;
  },
};