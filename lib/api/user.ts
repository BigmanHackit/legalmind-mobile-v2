import { apiClient } from "./client";

// Types based on your API responses
export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  firstName?: string;
  lastName?: string;
  age?: number;
  country?: string;
  profession?: string;
  purpose?: "RESEARCH" | "SCHOOL" | "OTHER";
  createdAt: string;
  updatedAt: string;
  wallet: {
    balance: number;
  }
  _count: {
    cases: number;
  };
}

export interface UserStatistics {
  user: User;
  cases: {
    total: number;
    byStatus: {
      FAILED?: number;
      COMPLETED?: number;
      PENDING?: number;
      REVIEW_REQUIRED?: number;
    };
  };
  analyses: {
    total: number;
    avgConfidence: number;
    avgProcessingTime: number;
  };
  contract: {
    total: number;
    byStatus: {
      FAILED?: number;
      COMPLETED?: number;
      PENDING?: number;
      REVIEW_REQUIRED?: number;
    };
  };
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "ADMIN" | "USER";
}

export interface UpdateUserDto {
  email?: string;
  role?: "ADMIN" | "USER";
  firstName?: string;
  lastName?: string;
  age?: number;
  country?: string;
  profession?: string;
  purpose?: "RESEARCH" | "SCHOOL" | "OTHER";
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: "ADMIN" | "USER";
}

export const usersApi = {
  // Create a new user (Admin only)
  createUser: async (userData: CreateUserDto): Promise<User> => {
    return apiClient.post<User>("/users", userData);
  },

  // Get all users with pagination (Admin only)
  getUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.role) searchParams.append("role", params.role);

    const queryString = searchParams.toString();
    const url = queryString ? `/users?${queryString}` : "/users";

    return apiClient.get<UsersResponse>(url);
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>("/users/me");
  },

  // Get current user statistics
  getCurrentUserStatistics: async (): Promise<UserStatistics> => {
    const response = await apiClient.get<UserStatistics>(
      "/users/me/statistics"
    );

    console.log("Raw API response:", response);

    return response;
  },

  // Get user by ID (Admin only)
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Get user statistics by ID (Admin only)
  getUserStatistics: async (id: string): Promise<UserStatistics> => {
    return apiClient.get<UserStatistics>(`/users/${id}/statistics`);
  },

  // Update current user profile
  updateCurrentUser: async (userData: UpdateUserDto): Promise<User> => {
    return apiClient.patch<User>("/users/me", userData);
  },

  // Update user by ID (Admin only)
  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, userData);
  },

  // Delete user (Admin only)
  deleteUser: async (id: string): Promise<User> => {
    return apiClient.delete<User>(`/users/${id}`);
  },
};
