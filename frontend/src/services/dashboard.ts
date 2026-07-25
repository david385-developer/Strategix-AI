import apiClient from "@/lib/api-client";

export const dashboardService = {
  async getOverview() {
    const res = await apiClient.get("/dashboard/overview");
    return res.data;
  },
};
