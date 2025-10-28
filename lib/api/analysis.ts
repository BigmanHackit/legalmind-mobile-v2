import { apiClient } from "./client";
import { Analysis, CreateAnalysisDto, PaginatedResponse } from "../types";

export const analysisApi = {
  async createAnalysis(analysisData: CreateAnalysisDto): Promise<Analysis> {
    return apiClient.post<Analysis>("/analysis", analysisData);
  },

  async getAnalyses(filters?: {
    page?: number;
    limit?: number;
    caseId?: string;
    status?: Analysis["status"];
  }): Promise<PaginatedResponse<Analysis>> {
    const params = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== undefined)
        )
      : {};
    return apiClient.get<PaginatedResponse<Analysis>>("/analysis", params);
  },

  async getAnalysisById(id: string): Promise<Analysis> {
    return apiClient.get<Analysis>(`/analysis/${id}`);
  },

  async regenerateAnalysis(id: string): Promise<Analysis> {
    return apiClient.post<Analysis>(`/analysis/${id}/regenerate`);
  },

  async reviewAnalysis(
    id: string,
    reviewData: { qualityScore: number; reviewNotes?: string }
  ): Promise<Analysis> {
    return apiClient.patch<Analysis>(`/analysis/${id}/review`, reviewData);
  },

  async exportAnalysis(
    id: string,
    format: "pdf" | "docx" | "html"
  ): Promise<{ message: string; analysisId: string; format: string }> {
    return apiClient.get(`/analysis/${id}/export/${format}`);
  },

  async getStatistics(): Promise<{
    totalAnalyses: number;
    averageConfidence: number;
    averageProcessingTime: number;
    statusBreakdown: Record<string, number>;
  }> {
    return apiClient.get("/analysis/stats");
  },
};