import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/services/media";

export function useMedia() {
  const queryClient = useQueryClient();

  const mediaQuery = useQuery({
    queryKey: ["mediaLibrary"],
    queryFn: async () => {
      const res = await mediaService.getMediaLibrary();
      return res.success ? res.data.mediaList : [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaService.uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
    },
  });

  return {
    mediaList: mediaQuery.data || [],
    isLoadingMedia: mediaQuery.isLoading,
    uploadMedia: uploadMutation.mutateAsync,
    isUploadingMedia: uploadMutation.isPending,
    deleteMedia: deleteMutation.mutateAsync,
    isDeletingMedia: deleteMutation.isPending,
  };
}
