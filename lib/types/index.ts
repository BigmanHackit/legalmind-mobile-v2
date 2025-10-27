/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: UserRole;
    avatar?: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
  }
  
  export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
  }
  
  export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
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
  
  export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }
  
  export interface VerifyEmailDto {
    token: string;
  }
  
  export interface ResendVerificationDto {
    email: string;
  }
  
  export interface ForgotPasswordDto {
    email: string;
  }
  
  export interface ResetPasswordDto {
    token: string;
    password: string;
  }
  export interface GoogleAuthDto {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    organizationId?: string;
  }
  
  // Token validation
  export interface TokenValidationResponse {
    valid: boolean;
    user?: User;
    exp?: number;
  }
  
  // Refresh token storage
  export interface StoredTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
  }
  
  export interface Jurisdiction {
    id: string;
    name: string;
    country: string;
    type: "FEDERAL" | "STATE" | "LOCAL";
    createdAt: string;
    _count?: {
      cases: number;
      statutes: number;
      precedents: number;
      LegalSource: number;
    };
  }
  
  export interface JurisdictionFilters {
    page?: number;
    limit?: number;
    country?: string;
    type?: Jurisdiction["type"];
    search?: string;
  }
  
  export interface CreateJurisdictionDto {
    name: string;
    country: string;
    type: "FEDERAL" | "STATE" | "LOCAL";
  }
  
  export interface UpdateJurisdictionDto {
    name?: string;
    country?: string;
    type?: "FEDERAL" | "STATE" | "LOCAL";
  }
  
  export interface Case {
    id: string;
    title: string;
    facts: string;
    caseType:
      | "CONTRACT"
      | "ADMINISTRATIVE"
      | "PROPERTY"
      | "FAMILY"
      | "CRIMINAL"
      | "COMMERCIAL"
      | "TORT"
      | "CIVIL"
      | "CONSTITUTIONAL";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "PENDING" | "ANALYZING" | "COMPLETED" | "FAILED" | "REVIEW_REQUIRED";
    isPublic: boolean;
    tags: string[];
    estimatedTime?: number;
    jurisdictionId: string;
    jurisdiction: Jurisdiction;
    userId: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      analyses: number;
      collaborators: number;
    };
    currentAnalysis?: Analysis;
  }
  
  export interface Analysis {
    id: string;
    caseId: string;
    analysisType: "QUICK" | "FULL" | "CUSTOM";
    methodology: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    confidence: number;
    issues: {
      primary: string[];
      secondary: string[];
    };
    statutes: Array<{
      statute: { title: string; section: string };
      relevance: number;
    }>;
    precedents: Array<{
      precedent: { caseTitle: string; citation: string };
      relevance: number;
    }>;
    rules: {
      statutes: {
        section: string;
        relevance: number;
        application: string;
      };
      precedents: string[];
      principles: string[];
    };
    application: string;
    conclusion: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateCaseDto {
    title: string;
    facts: string;
    caseType: Case["caseType"];
    priority?: Case["priority"];
    jurisdictionId: string;
    isPublic?: boolean;
    tags?: string[];
    estimatedTime?: number;
  }
  
  export interface CaseFilters {
    page?: number;
    limit?: number;
    status?: Case["status"];
    caseType?: Case["caseType"];
    priority?: Case["priority"];
    jurisdictionId?: string;
    search?: string;
  }
  
  export interface UploadCaseDto {
    file: File;
    jurisdictionId: string;
    title?: string;
    caseType?: Case["caseType"];
    priority?: Case["priority"];
    facts?: string;
    isPublic?: boolean;
    tags?: string[];
  }
  
  export interface UploadCaseResponse extends Case {
    extractedMetadata?: {
      title?: string;
      court?: string;
      year?: number;
      parties?: string[];
      citations?: string[];
      sections?: string[];
    };
  }
  
  export interface CreateAnalysisDto {
    caseId: string;
    analysisType?: Analysis["analysisType"];
    methodology?: string;
    confidenceThreshold?: number;
    focusAreas?: string[];
    excludeSources?: string[];
    maxPrecedents?: number;
    maxStatutes?: number;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
  
  // ============ PAYMENT TYPES ============
  
  export enum SubscriptionPlan {
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    PAY_PER_USE = "PAY_PER_USE",
  }
  
  export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT",
    REFUND = "REFUND",
    BONUS = "BONUS",
    REVERSAL = "REVERSAL",
  }
  
  export enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
  }
  
  export interface Plan {
    id: string;
    name: string;
    price: number;
    priceInKobo: number;
    billingCycle: string;
    features: string[];
    description: string;
  }
  
  export interface SubscriptionPlansResponse {
    plans: Plan[];
  }
  
  export interface InitializeSubscriptionResponse {
    transactionId: string;
    reference: string;
    authorizationUrl: string;
    plan: SubscriptionPlan;
    amount: number;
  }
  
  export interface VerifySubscriptionResponse {
    status: string;
    subscription: {
      id: string;
      plan: SubscriptionPlan;
      status: string;
      startDate: string;
      expiresAt: string;
      isActive: boolean;
    };
    message: string;
  }
  
  export interface CurrentSubscriptionResponse {
    hasActiveSubscription: boolean;
    subscription: {
      id: string;
      plan: SubscriptionPlan;
      status: string;
      startDate: string;
      expiresAt: string;
      isActive: boolean;
      daysRemaining: number;
      autoRenew: boolean;
    } | null;
    message: string;
  }
  
  export interface InitializeTopupResponse {
    transactionId: string;
    reference: string;
    authorizationUrl: string;
    amount: number;
    amountInKobo: number;
  }
  
  export interface VerifyTopupResponse {
    status: string;
    transaction: {
      id: string;
      reference: string;
      amount: number;
      type: TransactionType;
      status: TransactionStatus;
    };
    wallet: {
      balance: number;
      balanceInNGN: string;
    };
    message: string;
  }
  
  export interface WalletBalanceResponse {
    balance: number;
    balanceInNGN: string;
    currency: string;
    subscription: {
      plan: SubscriptionPlan;
      isActive: boolean;
      expiresAt: string;
      daysRemaining: number;
    } | null;
    creditSources: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  }
  
  export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
    status: TransactionStatus;
    gateway: string;
    description?: string;
    resourceType?: string;
    resourceId?: string;
    createdAt: string;
  }
  
  export interface TransactionHistoryResponse {
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  export interface PricingResponse {
    subscriptionPlans: Array<{
      plan: SubscriptionPlan;
      price: number;
      priceInNGN: string;
      features: string[];
      billingCycle: string;
    }>;
    servicesPricing: Array<{
      serviceType: string;
      price: number;
      priceInNGN: string;
      description?: string;
    }>;
    estimatedMonthlySavings: {
      monthly_vs_payPerUse: string;
      yearly_vs_monthly: string;
    };
  }
  
  export interface RevenueStatsResponse {
    totalRevenue: number;
    revenueByMonth: Array<{
      month: string;
      amount: number;
    }>;
    revenueByType: Array<{
      type: string;
      amount: number;
    }>;
  }
  
  export interface SubscriptionStatsResponse {
    totalSubscriptions: number;
    activeSubscriptions: number;
    subscriptionsByPlan: Array<{
      plan: SubscriptionPlan;
      count: number;
    }>;
    churnRate: number;
    retentionRate: number;
  }
  // ============ CONTRACT TYPES ============
  
  export enum ContractStatus {
    DRAFT = "DRAFT",
    PENDING_UPLOAD = "PENDING_UPLOAD",
    PENDING_ANALYSIS = "PENDING_ANALYSIS",
    ANALYZING = "ANALYZING",
    COMPLETED = "COMPLETED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    EXECUTED = "EXECUTED",
    TERMINATED = "TERMINATED",
  }
  
  export enum ContractType {
    EMPLOYMENT = "EMPLOYMENT",
    SERVICE_AGREEMENT = "SERVICE_AGREEMENT",
    SALE_OF_GOODS = "SALE_OF_GOODS",
    LEASE_RENTAL = "LEASE_RENTAL",
    PARTNERSHIP = "PARTNERSHIP",
    NON_DISCLOSURE = "NON_DISCLOSURE",
    LOAN_AGREEMENT = "LOAN_AGREEMENT",
    CONSULTANCY = "CONSULTANCY",
    SUPPLY_AGREEMENT = "SUPPLY_AGREEMENT",
    CONSTRUCTION = "CONSTRUCTION",
    INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY",
    JOINT_VENTURE = "JOINT_VENTURE",
    FRANCHISE = "FRANCHISE",
    DISTRIBUTION = "DISTRIBUTION",
    AGENCY = "AGENCY",
    TENANCY = "TENANCY",
    POWER_OF_ATTORNEY = "POWER_OF_ATTORNEY",
    MEMORANDUM_OF_UNDERSTANDING = "MEMORANDUM_OF_UNDERSTANDING",
    OTHER = "OTHER",
  }
  
  export enum PartyRole {
    PARTY_A = "PARTY_A",
    PARTY_B = "PARTY_B",
    PARTY_C = "PARTY_C",
    EMPLOYER = "EMPLOYER",
    EMPLOYEE = "EMPLOYEE",
    SERVICE_PROVIDER = "SERVICE_PROVIDER",
    CLIENT = "CLIENT",
    VENDOR = "VENDOR",
    BUYER = "BUYER",
    SELLER = "SELLER",
    LESSOR = "LESSOR",
    LESSEE = "LESSEE",
    LENDER = "LENDER",
    BORROWER = "BORROWER",
    OTHER = "OTHER",
  }
  
  export interface ContractParty {
    role: PartyRole;
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    registrationNumber?: string;
    representativeName?: string;
    contactInfo?: string;
  }
  
  export interface CreateContractDto {
    title: string;
    contractType: ContractType;
    jurisdictionId?: string; // Made optional
    content?: string;
    fileName?: string;
    fileSize?: number;
    representativeTitle?: string;
  }
  
  export interface UploadContractDto {
    title?: string; // Optional - defaults to filename
    contractType: ContractType; // Required
    jurisdictionId?: string; // Optional for uploads
  }
  
  export interface AnalyzeContractDto {
    contractType?: ContractType; // NEW: Optional override for contract type
    userPosition?: string;
    focusAreas?: string[];
  }
  
  export interface DraftContractDto {
    title: string;
    contractType: ContractType;
    jurisdictionId: string;
    requirements: string;
    parties?: ContractParty[];
    customizations?: Record<string, any>;
    inspirationTemplateIds?: string[];
    focusAreas?: string[];
  }
  
  export interface UpdateContractDto {
    title?: string;
    contractType?: ContractType;
    status?: ContractStatus;
    content?: string;
    isPublic?: boolean;
  }
  
  export interface Contract {
    id: string;
    title: string;
    contractType: ContractType;
    status: ContractStatus;
    content?: string;
    fileName?: string;
    fileSize?: number;
    jurisdictionId?: string;
    jurisdiction?: {
      id: string;
      name: string;
      country: string;
    };
    userId: string;
    isPublic: boolean;
    isPaid: boolean;
    transactionId?: string;
    costInKobo?: number;
    version: number;
    createdAt: string;
    updatedAt: string;
    analysis?: ContractAnalysis;
    parties?: ContractParty[];
  }
  
  export interface ContractAnalysis {
    id: string;
    contractId: string;
    overallRiskScore: number;
    riskFactors: any[];
    favorableTerms: any[];
    unfavorableTerms: any[];
    ambiguousTerms: any[];
    missingClauses: any[];
    recommendations: any[];
    redFlags: any[];
    executiveSummary: string;
    keyFindings: string;
    aiModel: string;
    confidence: number;
    processingTime: number;
    createdAt: string;
    updatedAt: string;
    terms?: ContractTerm[];
    clauses?: ContractClause[];
    obligations?: ContractObligation[];
  }
  
  export interface ContractTerm {
    id: string;
    category: string;
    title: string;
    content: string;
    isFavorable?: boolean;
    riskLevel: string;
    explanation?: string;
    section?: string;
    pageNumber?: number;
  }
  
  export interface ContractClause {
    id: string;
    type: string;
    title: string;
    content: string;
    isStandard: boolean;
    isEnforceable?: boolean;
    compliance: string;
    hasIssues: boolean;
    issues?: any[];
    suggestions?: any[];
    section?: string;
    clauseNumber?: string;
  }
  
  export interface ContractObligation {
    id: string;
    party: string;
    description: string;
    deadline?: string;
    isRecurring: boolean;
    isClear: boolean;
    isEnforceable: boolean;
    concerns?: string;
  }
  
  export interface ContractsListResponse {
    data: Contract[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  export interface ContractStatistics {
    total: number;
    overview: {
      total: number;
      averageRiskScore: string;
    };
    breakdown: {
      byStatus: Array<{
        status: ContractStatus;
        count: number;
      }>;
      byType: Array<{
        type: ContractType;
        count: number;
      }>;
    };
    recent: Array<{
      id: string;
      title: string;
      status: ContractStatus;
      contractType: ContractType;
      createdAt: string;
    }>;
  }
  
  export type UploadContractResponse = Contract;
  