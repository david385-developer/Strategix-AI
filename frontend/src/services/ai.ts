import apiClient from "@/lib/api-client";

export const aiService = {
  async chat(message: string, history: Array<{ role: "user" | "assistant"; content: string }>) {
    const res = await apiClient.post("/ai/chat", { message, history });
    return res.data;
  },

  async getSuggestions() {
    const res = await apiClient.get("/ai/suggestions");
    return res.data;
  },
};
