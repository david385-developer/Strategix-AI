import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService, BillingDetails } from "@/services/billing";

export function useBilling() {
  const queryClient = useQueryClient();

  const billingQuery = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      try {
        const res = await billingService.getBillingOverview();
        return res.success ? res.data : null;
      } catch (error) {
        console.error("Failed to load billing details:", error);
        return null;
      }
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (details: BillingDetails) => billingService.updateBillingDetails(details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => billingService.pauseSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => billingService.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const manualUpgradeMutation = useMutation({
    mutationFn: ({ planId, billingCycle }: { planId: string; billingCycle: "monthly" | "yearly" }) =>
      billingService.manualUpgrade(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    billingData: billingQuery.data,
    isLoading: billingQuery.isLoading,
    isError: billingQuery.isError,
    updateDetails: updateDetailsMutation.mutateAsync,
    isUpdatingDetails: updateDetailsMutation.isPending,
    cancelSubscription: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    pauseSubscription: pauseMutation.mutateAsync,
    isPausing: pauseMutation.isPending,
    resumeSubscription: resumeMutation.mutateAsync,
    isResuming: resumeMutation.isPending,
    manualUpgrade: manualUpgradeMutation.mutateAsync,
    isUpgrading: manualUpgradeMutation.isPending,
  };
}
