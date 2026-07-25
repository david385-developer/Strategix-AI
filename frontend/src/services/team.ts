import apiClient from "@/lib/api-client";

export const teamService = {
  async getTasks() {
    const res = await apiClient.get("/team/tasks");
    return res.data;
  },

  async createTask(taskData: {
    title: string;
    assignee: string;
    dueDate: string;
    campaign?: string;
    campaignId?: string;
  }) {
    const res = await apiClient.post("/team/tasks", taskData);
    return res.data;
  },

  async updateTask(id: string, taskData: any) {
    const res = await apiClient.put(`/team/tasks/${id}`, taskData);
    return res.data;
  },

  async deleteTask(id: string) {
    const res = await apiClient.delete(`/team/tasks/${id}`);
    return res.data;
  },
};
