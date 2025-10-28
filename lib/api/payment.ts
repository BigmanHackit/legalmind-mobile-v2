/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CurrentSubscriptionResponse,
  InitializeSubscriptionResponse,
  InitializeTopupResponse,
  PricingResponse,
  RevenueStatsResponse,
  SubscriptionPlan,
  SubscriptionPlansResponse,
  SubscriptionStatsResponse,
  TransactionHistoryResponse,
  TransactionStatus,
  TransactionType,
  VerifySubscriptionResponse,
  VerifyTopupResponse,
  WalletBalanceResponse,
} from "../types";
import { apiClient } from "./client";

export const paymentsApi = {
  // ============ SUBSCRIPTION ENDPOINTS ============

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
    return apiClient.get<SubscriptionPlansResponse>(
      "/payments/subscriptions/plans"
    );
  },

  /**
   * Initialize recurring subscription payment
   */
  async initializeSubscription(
    plan: SubscriptionPlan,
    metadata?: Record<string, any>
  ): Promise<InitializeSubscriptionResponse> {
    return apiClient.post<InitializeSubscriptionResponse>(
      "/payments/subscriptions/initialize",
      { plan, metadata }
    );
  },

  /**
   * Verify subscription payment
   */
  async verifySubscription(
    reference: string
  ): Promise<VerifySubscriptionResponse> {
    return apiClient.get<VerifySubscriptionResponse>(
      `/payments/subscriptions/verify/${reference}`
    );
  },

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    return apiClient.get<CurrentSubscriptionResponse>(
      "/payments/subscriptions/current"
    );
  },

  /**
   * Upgrade or downgrade subscription
   */
  async upgradeSubscription(
    newPlan: SubscriptionPlan
  ): Promise<InitializeSubscriptionResponse> {
    return apiClient.post<InitializeSubscriptionResponse>(
      "/payments/subscriptions/upgrade",
      { newPlan }
    );
  },

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<{
    status: string;
    message: string;
    subscription: any;
  }> {
    return apiClient.post("/payments/subscriptions/cancel");
  },

  // ============ PAY-PER-USE / TOP-UP ENDPOINTS ============

  /**
   * Initialize wallet top-up (Pay As You Go)
   */
  async initializeTopup(
    amount: number,
    metadata?: Record<string, any>
  ): Promise<InitializeTopupResponse> {
    return apiClient.post<InitializeTopupResponse>(
      "/payments/topup/initialize",
      { amount, metadata }
    );
  },

  /**
   * Verify wallet top-up payment
   */
  async verifyTopup(reference: string): Promise<VerifyTopupResponse> {
    return apiClient.get<VerifyTopupResponse>(
      `/payments/topup/verify/${reference}`
    );
  },

  /**
   * Get current wallet balance
   */
  async getWalletBalance(): Promise<WalletBalanceResponse> {
    return apiClient.get<WalletBalanceResponse>("/payments/wallet/balance");
  },

  /**
   * Get transaction history
   */
  async getTransactionHistory(params?: {
    page?: number;
    limit?: number;
    type?: TransactionType;
    status?: TransactionStatus;
  }): Promise<TransactionHistoryResponse> {
    return apiClient.get<TransactionHistoryResponse>(
      "/payments/wallet/transactions",
      params
    );
  },

  // ============ PRICING & ADMIN ENDPOINTS ============

  /**
   * Get all pricing information
   */
  async getPricing(): Promise<PricingResponse> {
    return apiClient.get<PricingResponse>("/payments/pricing");
  },

  /**
   * Update service pricing (Admin only)
   */
  async updatePricing(
    serviceType: string,
    price: number
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post("/payments/pricing", { serviceType, price });
  },

  /**
   * Get revenue statistics (Admin only)
   */
  async getRevenueStats(): Promise<RevenueStatsResponse> {
    return apiClient.get<RevenueStatsResponse>("/payments/stats/revenue");
  },

  /**
   * Get subscription statistics (Admin only)
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsResponse> {
    return apiClient.get<SubscriptionStatsResponse>(
      "/payments/stats/subscriptions"
    );
  },

  // ============ UTILITY FUNCTIONS ============

  /**
   * Format amount from kobo to NGN
   */
  formatAmount(kobo: number): string {
    return (kobo / 100).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });
  },

  /**
   * Convert NGN to kobo
   */
  toKobo(naira: number): number {
    return Math.round(naira * 100);
  },

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(requiredAmount: number): Promise<boolean> {
    try {
      const wallet = await this.getWalletBalance();
      return wallet.balance >= requiredAmount;
    } catch {
      return false;
    }
  },

  /**
   * Get subscription status
   */
  async isSubscriptionActive(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription.hasActiveSubscription;
    } catch {
      return false;
    }
  },
};
