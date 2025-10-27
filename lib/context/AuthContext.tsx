import {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
  } from "react";
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { authApi, RegisterResponse } from "../api/auth";
  import {
    User,
    LoginDto,
    RegisterDto,
    VerifyEmailDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendVerificationDto,
  } from "../types";
  
  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  
    // Auth actions
    login: (credentials: LoginDto) => Promise<void>;
    register: (userData: RegisterDto) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
  
    // Email verification
    verifyEmail: (
      data: VerifyEmailDto
    ) => Promise<{ message: string; canLogin: boolean }>;
    resendVerification: (
      data: ResendVerificationDto
    ) => Promise<{ message: string }>;
  
    // Password reset
    forgotPassword: (data: ForgotPasswordDto) => Promise<{ message: string }>;
    resetPassword: (data: ResetPasswordDto) => Promise<{ message: string }>;
  
    // Profile management
    refreshProfile: () => Promise<void>;
  
    // Token management
    revokeAllTokens: () => Promise<{ message: string; count: number }>;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const isAuthenticated = !!user;
  
    const login = async (credentials: LoginDto) => {
      try {
        const response = await authApi.login(credentials);
        setUser(response.user);
      } catch (error) {
        throw error;
      }
    };
  
    const register = async (userData: RegisterDto): Promise<RegisterResponse> => {
      try {
        const response = await authApi.register(userData);
        return response;
      } catch (error) {
        throw error;
      }
    };
  
    const verifyEmail = async (data: VerifyEmailDto) => {
      try {
        const response = await authApi.verifyEmail(data);
        return response;
      } catch (error) {
        throw error;
      }
    };
  
    const resendVerification = async (data: ResendVerificationDto) => {
      try {
        const response = await authApi.resendVerification(data);
        return response;
      } catch (error) {
        throw error;
      }
    };
  
    const forgotPassword = async (data: ForgotPasswordDto) => {
      try {
        const response = await authApi.forgotPassword(data);
        return response;
      } catch (error) {
        throw error;
      }
    };
  
    const resetPassword = async (data: ResetPasswordDto) => {
      try {
        const response = await authApi.resetPassword(data);
        return response;
      } catch (error) {
        throw error;
      }
    };
  
    const logout = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        await authApi.logout(refreshToken || undefined);
        setUser(null);
      } catch (error) {
        console.error("Logout error:", error);
        // Clear user even if API call fails
        setUser(null);
      }
    };
  
    const refreshProfile = async () => {
      try {
        const user = await authApi.getProfile();
        setUser(user);
      } catch (error) {
        console.error("Failed to refresh profile:", error);
        setUser(null);
      }
    };
  
    const revokeAllTokens = async () => {
      try {
        const response = await authApi.revokeAllTokens();
        setUser(null); // Force logout after revoking all tokens
        return response;
      } catch (error) {
        console.error("Failed to revoke all tokens:", error);
        throw error;
      }
    };
  
    // Initialize auth state on app load
    useEffect(() => {
      const initializeAuth = async () => {
        try {
          const accessToken = await AsyncStorage.getItem("access_token");
          const refreshToken = await AsyncStorage.getItem("refresh_token");
  
          if (accessToken && refreshToken) {
            try {
              // Try to get profile with existing token
              await refreshProfile();
            } catch (error) {
              console.error("Failed to initialize auth:", error);
              // Clear invalid tokens
              await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      initializeAuth();
    }, []);
  
    // Auto-refresh token when it's about to expire
    useEffect(() => {
      if (!user) return;
  
      const refreshInterval = setInterval(async () => {
        try {
          const token = await AsyncStorage.getItem("access_token");
          if (token) {
            try {
              // Decode JWT to check expiration
              const payload = JSON.parse(atob(token.split(".")[1]));
              const expiration = payload.exp * 1000; // Convert to milliseconds
              const now = Date.now();
              const timeUntilExpiry = expiration - now;
  
              // Refresh token if it expires within 2 minutes
              if (timeUntilExpiry < 2 * 60 * 1000) {
                await refreshProfile();
              }
            } catch (error) {
              console.error("Token refresh check failed:", error);
            }
          }
        } catch (error) {
          console.error("Token refresh interval error:", error);
        }
      }, 60 * 1000); // Check every minute
  
      return () => clearInterval(refreshInterval);
    }, [user]);
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          isAuthenticated,
          login,
          register,
          logout,
          verifyEmail,
          resendVerification,
          forgotPassword,
          resetPassword,
          refreshProfile,
          revokeAllTokens,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  }