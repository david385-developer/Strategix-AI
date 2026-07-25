import apiClient from "@/lib/api-client";

export const mediaService = {
  async uploadMedia(file: File, onProgress?: (pct: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },

  async getMediaLibrary() {
    const res = await apiClient.get("/media");
    return res.data;
  },

  async deleteMedia(id: string) {
    const res = await apiClient.delete(`/media/${id}`);
    return res.data;
  },
};
