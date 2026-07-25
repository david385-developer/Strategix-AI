import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandService } from "@/services/brand";

export function useBrand() {
  const queryClient = useQueryClient();

  const brandQuery = useQuery({
    queryKey: ["brandProfile"],
    queryFn: async () => {
      const res = await brandService.getBrandProfile();
      return res.success ? res.data.brand : null;
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: (brandData: any) => brandService.updateBrandProfile(brandData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandProfile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    brand: brandQuery.data,
    isLoading: brandQuery.isLoading,
    updateBrand: updateBrandMutation.mutateAsync,
    isUpdating: updateBrandMutation.isPending,
  };
}
