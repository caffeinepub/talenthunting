import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CandidateProfile,
  JobPosting,
  PortalRole,
  RoleType,
  WhitelistEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function useJobPostingCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["jobPostingCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getJobPostingCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCandidateProfileCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["candidateProfileCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCandidateProfileCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAllJobPostings(isAdmin = false) {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["allJobPostings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobPostings();
    },
    enabled: !!actor && !isFetching && isAdmin,
    retry: false,
  });
}

export function useAllCandidateProfiles(isAdmin = false) {
  const { actor, isFetching } = useActor();
  return useQuery<CandidateProfile[]>({
    queryKey: ["allCandidateProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCandidateProfiles();
    },
    enabled: !!actor && !isFetching && isAdmin,
    retry: false,
  });
}

export function useSubmitJobPosting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      companyName: string;
      jobTitle: string;
      roleType: RoleType;
      requiredSkills: string[];
      jobDescription: string;
      contactEmail: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitJobPosting(
        data.companyName,
        data.jobTitle,
        data.roleType,
        data.requiredSkills,
        data.jobDescription,
        data.contactEmail,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPostingCount"] });
      queryClient.invalidateQueries({ queryKey: ["allJobPostings"] });
    },
  });
}

type PortalUserSummary = { portalRole: PortalRole; username: string };

export function useListPortalUsers(isAdmin = false) {
  const { actor, isFetching } = useActor();
  return useQuery<PortalUserSummary[]>({
    queryKey: ["portalUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPortalUsers();
    },
    enabled: !!actor && !isFetching && isAdmin,
    retry: false,
  });
}

export function useAddPortalUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      passwordHash: string;
      portalRole: PortalRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPortalUser(
        data.username,
        data.passwordHash,
        data.portalRole,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalUsers"] });
    },
  });
}

export function useChangePortalUserPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { username: string; newPasswordHash: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.changePortalUserPassword(
        data.username,
        data.newPasswordHash,
      );
    },
  });
}

export function useRegisterCandidateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      email: string;
      skills: string[];
      preferredRoleType: RoleType;
      cvLink: string;
      bio: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCandidateProfile(
        data.fullName,
        data.email,
        data.skills,
        data.preferredRoleType,
        data.cvLink,
        data.bio,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfileCount"] });
      queryClient.invalidateQueries({ queryKey: ["allCandidateProfiles"] });
    },
  });
}

export function useEmailWhitelist(isAdmin = false) {
  const { actor, isFetching } = useActor();
  return useQuery<WhitelistEntry[]>({
    queryKey: ["emailWhitelist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEmailWhitelist();
    },
    enabled: !!actor && !isFetching && isAdmin,
    retry: false,
  });
}

export function useAddEmailToWhitelist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; note: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEmailToWhitelist(data.email, data.note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailWhitelist"] });
    },
  });
}

export function useRemoveEmailFromWhitelist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeEmailFromWhitelist(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailWhitelist"] });
    },
  });
}
export function useClaimAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adminToken: string) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any)._initializeAccessControlWithSecret(adminToken);
      // Immediately re-check admin status to confirm the token worked
      const isAdmin: boolean = await (actor as any).isCallerAdmin();
      if (!isAdmin) {
        throw new Error(
          "Token accepted but admin status not granted. Please verify your CAFFEINE_ADMIN_TOKEN.",
        );
      }
    },
    onSuccess: async () => {
      // Invalidate ALL queries and explicitly refetch admin status
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}
