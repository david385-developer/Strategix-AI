import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";

export function useWorkspace() {
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        const res = await workspaceService.getWorkspaces();
        return res.success ? res.data.workspaces : [];
      } catch {
        return [];
      }
    },
  });

  const activeWorkspaceQuery = useQuery({
    queryKey: ["activeWorkspace"],
    queryFn: async () => {
      try {
        const res = await workspaceService.getActiveWorkspaceDetails();
        return res.success ? res.data.workspace : null;
      } catch {
        return null;
      }
    },
  });

  const teamMembersQuery = useQuery({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      try {
        const res = await workspaceService.getTeamMembers();
        return res.success ? res.data.members : [];
      } catch {
        return [];
      }
    },
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: ({ name, urlSlug }: { name: string; urlSlug: string }) =>
      workspaceService.createWorkspace(name, urlSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const switchWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: string) => workspaceService.switchWorkspace(workspaceId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(["currentUser"], data.data.user);
        queryClient.invalidateQueries({ queryKey: ["activeWorkspace"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["content"] });
        queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
      }
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (memberData: { name: string; email: string; role: string }) =>
      workspaceService.inviteMember(memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });

  return {
    workspaces: workspacesQuery.data || [],
    isLoadingWorkspaces: workspacesQuery.isLoading,
    activeWorkspace: activeWorkspaceQuery.data,
    isLoadingActiveWorkspace: activeWorkspaceQuery.isLoading,
    teamMembers: teamMembersQuery.data || [],
    isLoadingTeamMembers: teamMembersQuery.isLoading,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    isCreatingWorkspace: createWorkspaceMutation.isPending,
    switchWorkspace: switchWorkspaceMutation.mutateAsync,
    isSwitchingWorkspace: switchWorkspaceMutation.isPending,
    inviteMember: inviteMemberMutation.mutateAsync,
    isInvitingMember: inviteMemberMutation.isPending,
  };
}
