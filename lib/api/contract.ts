/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    AnalyzeContractDto,
    Contract,
    ContractAnalysis,
    ContractsListResponse,
    ContractStatistics,
    ContractStatus,
    ContractType,
    CreateContractDto,
    DraftContractDto,
    PartyRole,
    UpdateContractDto,
    UploadContractDto,
    UploadContractResponse,
  } from "../types";
  import { apiClient } from "./client";
  
  export const contractsApi = {
    // ============ BASIC CRUD OPERATIONS ============
  
    /**
     * Create a new contract record
     */
    async create(data: CreateContractDto): Promise<Contract> {
      return apiClient.post<Contract>("/contracts", data);
    },
  
    /**
     * Get all contracts with filters
     */
    async getAll(params?: {
      page?: number;
      limit?: number;
      status?: ContractStatus;
      contractType?: ContractType;
      search?: string;
    }): Promise<ContractsListResponse> {
      return apiClient.get<ContractsListResponse>("/contracts", params);
    },
  
    /**
     * Get contract by ID
     */
    async getById(id: string): Promise<Contract> {
      return apiClient.get<Contract>(`/contracts/${id}`);
    },
  
    /**
     * Update contract
     */
    async update(id: string, data: UpdateContractDto): Promise<Contract> {
      return apiClient.patch<Contract>(`/contracts/${id}`, data);
    },
  
    /**
     * Get full contract analysis with all details
     */
    async getContractAnalysis(id: string): Promise<ContractAnalysis> {
      return apiClient.get<ContractAnalysis>(`/contracts/${id}/analysis`);
    },
  
    /**
     * Delete contract
     */
    async delete(id: string): Promise<{ success: boolean; message: string }> {
      return apiClient.delete(`/contracts/${id}`);
    },
  
    /**
     * Get contract statistics
     */
    async getStatistics(): Promise<ContractStatistics> {
      return apiClient.get<ContractStatistics>("/contracts/statistics");
    },
  
    // ============ FILE UPLOAD & ANALYSIS ============
  
    /**
     * Upload contract file for analysis
     * UPDATED: contractType is now required, jurisdictionId is optional
     */
    async uploadContract(
      file: File,
      metadata: UploadContractDto
    ): Promise<UploadContractResponse> {
      const formData = new FormData();
      formData.append("file", file);
  
      // Title is optional - defaults to filename on backend
      if (metadata.title) {
        formData.append("title", metadata.title);
      }
  
      // Contract type is required
      formData.append("contractType", metadata.contractType);
  
      // Jurisdiction is optional for uploads
      if (metadata.jurisdictionId) {
        formData.append("jurisdictionId", metadata.jurisdictionId);
      }
  
      const response = await fetch(`${apiClient["baseURL"]}/contracts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiClient["accessToken"]}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Upload failed",
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
  
      return response.json();
    },
  
    /**
     * Analyze uploaded contract
     * UPDATED: Now accepts optional contractType override and focusAreas
     */
    async analyzeContract(
      contractId: string,
      options?: AnalyzeContractDto
    ): Promise<ContractAnalysis> {
      return apiClient.post<ContractAnalysis>(
        `/contracts/${contractId}/analyze`,
        options || {}
      );
    },
  
    // ============ CONTRACT DRAFTING ============
  
    /**
     * Draft a new contract
     */
    async draftContract(data: DraftContractDto): Promise<Contract> {
      return apiClient.post<Contract>("/contracts/draft", data);
    },
  
    // ============ UTILITY FUNCTIONS ============
  
    /**
     * Get contract types for dropdown
     */
    getContractTypes(): Array<{ value: ContractType; label: string }> {
      return [
        { value: ContractType.EMPLOYMENT, label: "Employment Contract" },
        { value: ContractType.SERVICE_AGREEMENT, label: "Service Agreement" },
        { value: ContractType.SALE_OF_GOODS, label: "Sale of Goods" },
        { value: ContractType.LEASE_RENTAL, label: "Lease/Rental Agreement" },
        { value: ContractType.PARTNERSHIP, label: "Partnership Agreement" },
        {
          value: ContractType.NON_DISCLOSURE,
          label: "Non-Disclosure Agreement (NDA)",
        },
        { value: ContractType.LOAN_AGREEMENT, label: "Loan Agreement" },
        { value: ContractType.CONSULTANCY, label: "Consultancy Agreement" },
        { value: ContractType.SUPPLY_AGREEMENT, label: "Supply Agreement" },
        { value: ContractType.CONSTRUCTION, label: "Construction Contract" },
        {
          value: ContractType.INTELLECTUAL_PROPERTY,
          label: "Intellectual Property",
        },
        { value: ContractType.JOINT_VENTURE, label: "Joint Venture" },
        { value: ContractType.FRANCHISE, label: "Franchise Agreement" },
        { value: ContractType.DISTRIBUTION, label: "Distribution Agreement" },
        { value: ContractType.AGENCY, label: "Agency Agreement" },
        { value: ContractType.TENANCY, label: "Tenancy Agreement" },
        { value: ContractType.POWER_OF_ATTORNEY, label: "Power of Attorney" },
        {
          value: ContractType.MEMORANDUM_OF_UNDERSTANDING,
          label: "Memorandum of Understanding (MoU)",
        },
        { value: ContractType.OTHER, label: "Other" },
      ];
    },
  
    /**
     * Get contract statuses for filtering
     */
    getContractStatuses(): Array<{ value: ContractStatus; label: string }> {
      return [
        { value: ContractStatus.DRAFT, label: "Draft" },
        { value: ContractStatus.PENDING_UPLOAD, label: "Pending Upload" },
        { value: ContractStatus.PENDING_ANALYSIS, label: "Pending Analysis" },
        { value: ContractStatus.ANALYZING, label: "Analyzing" },
        { value: ContractStatus.COMPLETED, label: "Completed" },
        { value: ContractStatus.UNDER_REVIEW, label: "Under Review" },
        { value: ContractStatus.APPROVED, label: "Approved" },
        { value: ContractStatus.EXECUTED, label: "Executed" },
        { value: ContractStatus.TERMINATED, label: "Terminated" },
      ];
    },
  
    /**
     * Get party roles for forms
     */
    getPartyRoles(): Array<{ value: PartyRole; label: string }> {
      return [
        { value: PartyRole.PARTY_A, label: "Party A" },
        { value: PartyRole.PARTY_B, label: "Party B" },
        { value: PartyRole.PARTY_C, label: "Party C" },
        { value: PartyRole.EMPLOYER, label: "Employer" },
        { value: PartyRole.EMPLOYEE, label: "Employee" },
        { value: PartyRole.SERVICE_PROVIDER, label: "Service Provider" },
        { value: PartyRole.CLIENT, label: "Client" },
        { value: PartyRole.VENDOR, label: "Vendor" },
        { value: PartyRole.BUYER, label: "Buyer" },
        { value: PartyRole.SELLER, label: "Seller" },
        { value: PartyRole.LESSOR, label: "Lessor" },
        { value: PartyRole.LESSEE, label: "Lessee" },
        { value: PartyRole.LENDER, label: "Lender" },
        { value: PartyRole.BORROWER, label: "Borrower" },
        { value: PartyRole.OTHER, label: "Other" },
      ];
    },
  
    /**
     * Format risk score to percentage
     */
    formatRiskScore(score: number): string {
      return `${(score * 100).toFixed(1)}%`;
    },
  
    /**
     * Get risk level color
     */
    getRiskLevelColor(riskLevel: string): string {
      const colors: Record<string, string> = {
        VERY_LOW: "green",
        LOW: "blue",
        MEDIUM: "yellow",
        HIGH: "orange",
        CRITICAL: "red",
      };
      return colors[riskLevel] || "gray";
    },
  
    /**
     * Get status badge color
     */
    getStatusColor(status: ContractStatus): string {
      const colors: Record<ContractStatus, string> = {
        DRAFT: "gray",
        PENDING_UPLOAD: "gray",
        PENDING_ANALYSIS: "yellow",
        ANALYZING: "blue",
        COMPLETED: "green",
        UNDER_REVIEW: "yellow",
        APPROVED: "green",
        EXECUTED: "purple",
        TERMINATED: "red",
      };
      return colors[status] || "gray";
    },
  
    /**
     * Format file size
     */
    formatFileSize(bytes?: number): string {
      if (!bytes) return "N/A";
      const kb = bytes / 1024;
      const mb = kb / 1024;
      return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    },
  
    /**
     * Validate file before upload
     */
    validateFile(file: File): { valid: boolean; error?: string } {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
  
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: "Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.",
        };
      }
  
      if (file.size > maxSize) {
        return {
          valid: false,
          error: "File size exceeds 10MB limit.",
        };
      }
  
      return { valid: true };
    },
  
    /**
     * Export contract analysis to different formats
     */
    async exportAnalysis(
      contractId: string,
      format: "pdf" | "docx" | "json" = "pdf"
    ): Promise<Blob> {
      const response = await fetch(
        `${apiClient["baseURL"]}/contracts/${contractId}/export?format=${format}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiClient["accessToken"]}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Export failed");
      }
  
      return response.blob();
    },
  };