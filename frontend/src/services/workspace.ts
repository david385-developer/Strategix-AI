import apiClient from "@/lib/api-client";

export const workspaceService = {
  async createWorkspace(name: string, urlSlug: string) {
    const res = await apiClient.post("/workspaces", { name, urlSlug });
    return res.data;
  },

  async getWorkspaces() {
    const res = await apiClient.get("/workspaces");
    return res.data;
  },

  async getActiveWorkspaceDetails() {
    const res = await apiClient.get("/workspaces/details");
    return res.data;
  },

  async switchWorkspace(workspaceId: string) {
    const res = await apiClient.post("/workspaces/switch", { workspaceId });
    if (res.data?.success) {
      const user = res.data.data.user;
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...user }));
    }
    return res.data;
  },

  async getTeamMembers() {
    const res = await apiClient.get("/workspaces/team");
    return res.data;
  },

  async inviteMember(memberData: { name: string; email: string; role: string }) {
    const res = await apiClient.post("/workspaces/invite", memberData);
    return res.data;
  },
};
