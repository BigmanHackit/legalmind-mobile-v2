import { apiClient } from './client';
import { CreateJurisdictionDto, Jurisdiction, PaginatedResponse, UpdateJurisdictionDto } from '../types';

export interface JurisdictionFilters {
  page?: number;
  limit?: number;
  country?: string;
  type?: Jurisdiction['type'];
  search?: string;
}

export const jurisdictionsApi = {
  async getJurisdictions(filters?: JurisdictionFilters): Promise<PaginatedResponse<Jurisdiction>> {
    const params = filters ? Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined)
    ) : undefined;
    return apiClient.get<PaginatedResponse<Jurisdiction>>('/jurisdictions', params);
  },

  async getJurisdictionById(id: string): Promise<Jurisdiction> {
    return apiClient.get<Jurisdiction>(`/jurisdictions/${id}`);
  },

  async createJurisdiction(data: CreateJurisdictionDto): Promise<Jurisdiction> {
    return apiClient.post<Jurisdiction>('/jurisdictions', data);
  },

  async updateJurisdiction(id: string, data: UpdateJurisdictionDto): Promise<Jurisdiction> {
    return apiClient.patch<Jurisdiction>(`/jurisdictions/${id}`, data);
  },

  async deleteJurisdiction(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/jurisdictions/${id}`);
  },


  async getCountries(): Promise<Array<{ country: string; count: number }>> {
    return apiClient.get<Array<{ country: string; count: number }>>('/jurisdictions/countries');
  },

  async getJurisdictionStatistics(id: string): Promise<never> {
    return apiClient.get(`/jurisdictions/${id}/statistics`);
  }
};