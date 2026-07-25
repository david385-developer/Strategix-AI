import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentService, ContentQueryParams } from "@/services/content";

export function useContent(params: ContentQueryParams = {}) {
  const queryClient = useQueryClient();

  const contentQuery = useQuery({
    queryKey: ["content", params],
    queryFn: async () => {
      try {
        const res = await contentService.getContentItems(params);
        return res.success ? res.data : { contentItems: [], pagination: {} };
      } catch {
        return { contentItems: [], pagination: {} };
      }
    },
  });

  const createContentMutation = useMutation({
    mutationFn: (contentData: any) => contentService.createContent(contentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: (generationParams: {
      campaignId?: string;
      type: string;
      platform: string;
      promptText: string;
    }) => contentService.generateAIContent(generationParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contentService.updateContent(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); queryClient.invalidateQueries({ queryKey: ["calendar"] }); },
  });

  return {
    contentItems: contentQuery.data?.contentItems || [],
    pagination: contentQuery.data?.pagination || {},
    isLoading: contentQuery.isLoading,
    isError: contentQuery.isError,
    refetch: contentQuery.refetch,
    createContent: createContentMutation.mutateAsync,
    isCreating: createContentMutation.isPending,
    generateAIContent: generateAIContentMutation.mutateAsync,
    isGenerating: generateAIContentMutation.isPending,
    updateContent: updateContentMutation.mutateAsync,
  };
}

export function useContentItem(id?: string) {
  const queryClient = useQueryClient();

  const itemQuery = useQuery({
    queryKey: ["contentItem", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await contentService.getContentById(id);
      return res.success ? res.data.content : null;
    },
    enabled: !!id,
  });

  const updateContentMutation = useMutation({
    mutationFn: (contentData: any) => {
      if (!id) throw new Error("No content ID provided");
      return contentService.updateContent(id, contentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentItem", id] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("No content ID provided");
      return contentService.deleteContent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const rewriteContentMutation = useMutation({
    mutationFn: (instruction: string) => {
      if (!id) throw new Error("No content ID provided");
      return contentService.rewriteAIContent(id, instruction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentItem", id] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    contentItem: itemQuery.data,
    isLoading: itemQuery.isLoading,
    isError: itemQuery.isError,
    updateContent: updateContentMutation.mutateAsync,
    isUpdating: updateContentMutation.isPending,
    deleteContent: deleteContentMutation.mutateAsync,
    isDeleting: deleteContentMutation.isPending,
    rewriteContent: rewriteContentMutation.mutateAsync,
    isRewriting: rewriteContentMutation.isPending,
  };
}
