import { useQuery, useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/ai";

export function useAI() {
  const chatMutation = useMutation({
    mutationFn: ({
      message,
      history,
    }: {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    }) => aiService.chat(message, history),
  });

  const suggestionsQuery = useQuery({
    queryKey: ["aiSuggestions"],
    queryFn: async () => {
      try {
        const res = await aiService.getSuggestions();
        return res.success ? res.data.suggestions : [];
      } catch {
        return [];
      }
    },
  });

  return {
    chat: chatMutation.mutateAsync,
    isChatting: chatMutation.isPending,
    suggestions: suggestionsQuery.data || [],
    isLoadingSuggestions: suggestionsQuery.isLoading,
  };
}
