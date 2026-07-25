import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService, CampaignQueryParams } from "@/services/campaign";

export function useCampaigns(params: CampaignQueryParams = {}) {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () => {
      try {
        const res = await campaignService.getCampaigns(params);
        return res.success ? res.data : { campaigns: [], pagination: {} };
      } catch {
        return { campaigns: [], pagination: {} };
      }
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => campaignService.createCampaign(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    campaigns: campaignsQuery.data?.campaigns || [],
    pagination: campaignsQuery.data?.pagination || {},
    isLoading: campaignsQuery.isLoading,
    isError: campaignsQuery.isError,
    refetch: campaignsQuery.refetch,
    createCampaign: createCampaignMutation.mutateAsync,
    isCreating: createCampaignMutation.isPending,
  };
}

export function useCampaign(id?: string) {
  const queryClient = useQueryClient();

  const campaignQuery = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await campaignService.getCampaignById(id);
        return res.success ? res.data.campaign : null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  const updateCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => {
      if (!id) throw new Error("No campaign ID provided");
      return campaignService.updateCampaign(id, campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("No campaign ID provided");
      return campaignService.deleteCampaign(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const aiStrategyQuery = useQuery({
    queryKey: ["campaignStrategy", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await campaignService.getAIStrategy(id);
        return res.success ? res.data.strategy : null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  const generateStrategyMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("No campaign ID provided");
      return campaignService.generateAIStrategy(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaignStrategy", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  return {
    campaign: campaignQuery.data,
    isLoading: campaignQuery.isLoading,
    isError: campaignQuery.isError,
    updateCampaign: updateCampaignMutation.mutateAsync,
    isUpdating: updateCampaignMutation.isPending,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    isDeleting: deleteCampaignMutation.isPending,
    aiStrategy: aiStrategyQuery.data,
    isLoadingStrategy: aiStrategyQuery.isLoading,
    generateStrategy: generateStrategyMutation.mutateAsync,
    isGeneratingStrategy: generateStrategyMutation.isPending,
  };
}
