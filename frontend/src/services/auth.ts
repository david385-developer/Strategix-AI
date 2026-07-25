import apiClient from "@/lib/api-client";

export const authService = {
  async register(userData: any) {
    const res = await apiClient.post("/auth/register", userData);
    if (res.data?.success) {
      localStorage.setItem("accessToken", res.data.data.token);
      localStorage.setItem("refreshToken", res.data.data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async login(credentials: any) {
    const res = await apiClient.post("/auth/login", credentials);
    if (res.data?.success) {
      localStorage.setItem("accessToken", res.data.data.token);
      localStorage.setItem("refreshToken", res.data.data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    return true;
  },

  async getMe() {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  async updateProfile(profileData: any) {
    const res = await apiClient.put("/settings/profile", profileData);
    if (res.data?.success) {
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async changePassword(passwordData: any) {
    const res = await apiClient.put("/settings/password", passwordData);
    return res.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
