import apiClient from "@/lib/api-client";

export interface CampaignQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
  sort?: string;
  order?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export const campaignService = {
  async getCampaigns(params: CampaignQueryParams = {}) {
    const res = await apiClient.get("/campaigns", { params });
    return res.data;
  },

  async getCampaignById(id: string) {
    const res = await apiClient.get(`/campaigns/${id}`);
    return res.data;
  },

  async createCampaign(campaignData: any) {
    const res = await apiClient.post("/campaigns", campaignData);
    return res.data;
  },

  async updateCampaign(id: string, campaignData: any) {
    const res = await apiClient.put(`/campaigns/${id}`, campaignData);
    return res.data;
  },

  async deleteCampaign(id: string) {
    const res = await apiClient.delete(`/campaigns/${id}`);
    return res.data;
  },

  async getAIStrategy(id: string) {
    const res = await apiClient.get(`/campaigns/${id}/strategy`);
    return res.data;
  },

  async generateAIStrategy(id: string) {
    const res = await apiClient.post(`/campaigns/${id}/strategy/generate`);
    return res.data;
  },
};
