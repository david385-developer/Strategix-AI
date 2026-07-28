import apiClient from "@/lib/api-client";

export const integrationsService = {
  async getGoogleStatus() {
    const res = await apiClient.get("/integrations/google/status");
    return res.data;
  },

  async disconnectGoogle() {
    const res = await apiClient.post("/integrations/google/disconnect");
    return res.data;
  },

  async getLinkedinStatus() {
    const res = await apiClient.get("/integrations/linkedin/status");
    return res.data;
  },

  async disconnectLinkedin() {
    const res = await apiClient.post("/integrations/linkedin/disconnect");
    return res.data;
  },
};
