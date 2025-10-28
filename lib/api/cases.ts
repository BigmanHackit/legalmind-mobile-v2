/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./client";
import { Case, CreateCaseDto, PaginatedResponse, UploadCaseDto } from "../types";

export interface CaseFilters {
  page?: number;
  limit?: number;
  status?: Case["status"];
  caseType?: Case["caseType"];
  priority?: Case["priority"];
  jurisdictionId?: string;  
  search?: string;
}

export const casesApi = {
  async createCase(caseData: CreateCaseDto): Promise<Case> {
    return apiClient.post<Case>("/cases", caseData);
  },

  async uploadCaseFile(uploadData: UploadCaseDto): Promise<Case> {
    const formData = new FormData();
    
    // Add the file
    formData.append("file", uploadData.file);
    
    // Add required fields
    formData.append("jurisdictionId", uploadData.jurisdictionId);
    
    // Add optional fields
    if (uploadData.title) {
      formData.append("title", uploadData.title);
    }
    if (uploadData.caseType) {
      formData.append("caseType", uploadData.caseType);
    }
    if (uploadData.priority) {
      formData.append("priority", uploadData.priority);
    }
    if (uploadData.facts) {
      formData.append("facts", uploadData.facts);
    }
    if (uploadData.isPublic !== undefined) {
      formData.append("isPublic", String(uploadData.isPublic));
    }
    
    // Add tags as individual array items (not JSON string)
    if (uploadData.tags && uploadData.tags.length > 0) {
      uploadData.tags.forEach(tag => {
        formData.append("tags[]", tag);
      });
    }
  
    // Use the same token management as apiClient
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }
  
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/upload`;
  
    // Make the request with FormData
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // DON'T set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });
  
    // Handle 401 with refresh token logic (matching apiClient behavior)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          // Refresh the token
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
  
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("access_token", refreshData.access_token);
            
            // Retry the upload with new token
            const retryResponse = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${refreshData.access_token}`,
              },
              body: formData,
            });
  
            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({
                message: `Upload failed with status ${retryResponse.status}`
              }));
              throw new Error(error.message || "File upload failed");
            }
  
            return retryResponse.json();
          }
        } catch {
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
          window.location.href = "/auth/login";
          throw new Error("Session expired. Please log in again.");
        }
      }
      
      // No refresh token, just clear and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      window.location.href = "/auth/login";
      throw new Error("Session expired. Please log in again.");
    }
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Upload failed with status ${response.status}`
      }));
      throw new Error(error.message || "File upload failed");
    }
  
    return response.json();
  },

  async getCases(filters?: CaseFilters): Promise<PaginatedResponse<Case>> {
    const params = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        )
      : undefined;
    return apiClient.get<PaginatedResponse<Case>>("/cases", params);
  },

  async getCaseById(id: string): Promise<Case> {
    return apiClient.get<Case>(`/cases/${id}`);
  },

  async updateCase(id: string, updates: Partial<CreateCaseDto>): Promise<Case> {
    return apiClient.patch<Case>(`/cases/${id}`, updates);
  },

  async deleteCase(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/cases/${id}`);
  },

  async getCaseStatistics(): Promise<{
    totalCases: number;
    completedAnalyses: number;
    activeAnalyses: number;
    averageConfidence: number;
  }> {
    return apiClient.get<any>("/cases/statistics");
  },

  async addCollaborator(
    caseId: string,
    email: string,
    permission: "READ" | "WRITE"
  ): Promise<any> {
    return apiClient.post(`/cases/${caseId}/collaborators`, {
      email,
      permission,
    });
  },

  async removeCollaborator(
    caseId: string,
    collaboratorId: string
  ): Promise<any> {
    return apiClient.delete(`/cases/${caseId}/collaborators/${collaboratorId}`);
  },
};
