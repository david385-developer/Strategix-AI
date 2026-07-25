import apiClient from "@/lib/api-client";

export const analyticsService = {
  async getOverview(range = "7d") {
    const res = await apiClient.get("/analytics/overview", {
      params: { range },
    });
    return res.data;
  },
};
