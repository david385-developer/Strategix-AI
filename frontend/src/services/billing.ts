import apiClient from "@/lib/api-client";

export interface BillingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: string;
  gstNumber: string;
  companyName: string;
}

export const billingService = {
  async getBillingOverview() {
    const res = await apiClient.get("/subscriptions/billing");
    return res.data;
  },

  async updateBillingDetails(details: BillingDetails) {
    const res = await apiClient.put("/subscriptions/billing", details);
    return res.data;
  },

  async cancelSubscription() {
    const res = await apiClient.post("/subscriptions/cancel");
    return res.data;
  },

  async pauseSubscription() {
    const res = await apiClient.post("/subscriptions/pause");
    return res.data;
  },

  async resumeSubscription() {
    const res = await apiClient.post("/subscriptions/resume");
    return res.data;
  },

  async createCheckout(planId: string, billingCycle: "monthly" | "yearly" = "monthly") {
    const res = await apiClient.post("/payment/checkout", { planId, billingCycle });
    return res.data;
  },

  async verifyPayment(paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const res = await apiClient.post("/payment/verify", paymentData);
    return res.data;
  },

  async manualUpgrade(planId: string, billingCycle: "monthly" | "yearly" = "monthly") {
    const res = await apiClient.post("/subscriptions/manual-upgrade", { planId, billingCycle });
    return res.data;
  },
};
