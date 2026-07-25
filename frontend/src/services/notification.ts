import apiClient from "@/lib/api-client";

export const notificationService = {
  async getNotifications() {
    const res = await apiClient.get("/notifications");
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.put("/notifications/read-all");
    return res.data;
  },
};
