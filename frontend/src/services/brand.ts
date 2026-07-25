import apiClient from "@/lib/api-client";

export const brandService = {
  async getBrandProfile() {
    const res = await apiClient.get("/brand");
    return res.data;
  },

  async updateBrandProfile(brandData: any) {
    const res = await apiClient.put("/brand", brandData);
    return res.data;
  },
};
