import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await authService.getMe();
        return res.success ? res.data.user : null;
      } catch (err) {
        return null;
      }
    },
    initialData: authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => authService.login(credentials),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(["currentUser"], data.data.user);
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: any) => authService.register(userData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(["currentUser"], data.data.user);
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => authService.updateProfile(profileData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(["currentUser"], data.data.user);
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: any) => authService.changePassword(passwordData),
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
