import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics";

export function useAnalytics(range = "7d") {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      try {
        const res = await analyticsService.getOverview(range);
        return res.success ? res.data : null;
      } catch {
        return null;
      }
    },
  });
}
