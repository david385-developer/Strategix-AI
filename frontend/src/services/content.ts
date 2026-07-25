import apiClient from "@/lib/api-client";

export interface ContentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  platform?: string;
  sort?: string;
  campaign?: string;
  favorite?: boolean | string;
}

export const contentService = {
  async getContentItems(params: ContentQueryParams = {}) {
    const res = await apiClient.get("/content", { params });
    return res.data;
  },

  async getContentById(id: string) {
    const res = await apiClient.get(`/content/${id}`);
    return res.data;
  },

  async createContent(contentData: any) {
    const res = await apiClient.post("/content", contentData);
    return res.data;
  },

  async updateContent(id: string, contentData: any) {
    const res = await apiClient.put(`/content/${id}`, contentData);
    return res.data;
  },

  async deleteContent(id: string) {
    const res = await apiClient.delete(`/content/${id}`);
    return res.data;
  },

  async generateAIContent(generationParams: {
    campaignId?: string;
    type: string;
    platform: string;
    promptText: string;
    action?: "generate" | "rewrite" | "expand" | "shorten" | "improve-tone" | "optimize-seo";
  }) {
    const res = await apiClient.post("/content/generate", generationParams);
    return res.data;
  },

  async rewriteAIContent(id: string, instruction: string) {
    const res = await apiClient.post(`/content/${id}/rewrite`, { instruction });
    return res.data;
  },
};
