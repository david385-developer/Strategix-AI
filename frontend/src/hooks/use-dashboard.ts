import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        const res = await dashboardService.getOverview();
        return res.success ? res.data : null;
      } catch {
        return null;
      }
    },
  });
}
