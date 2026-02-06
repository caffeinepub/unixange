import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorInitGuard } from './useActorInitGuard';
import type {
  BuySellItem,
  RentalItem,
  LostFoundItem,
  UserProfile,
  OnboardingAnswers,
  MinimalItem,
  Variant_found_lost_rent_buySell,
} from '../backend';
import { ExternalBlob } from '../backend';
import { withTimeout } from '../utils/promiseTimeout';
import { sanitizeErrorMessage } from '../utils/sanitizeErrorMessage';

const PROFILE_QUERY_TIMEOUT = 15000; // 15 seconds

// ========== User Profile Queries ==========

export function useGetCallerUserProfile() {
  const actorGuard = useActorInitGuard();
  const { actor, isInitializing: actorFetching, status: actorInitStatus, error: actorInitError } = actorGuard;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const profile = await withTimeout(
          actor.getCallerUserProfile(),
          PROFILE_QUERY_TIMEOUT,
          'Profile fetch timed out after 15 seconds'
        );
        return profile;
      } catch (error) {
        // Log raw error to console
        console.error('Profile fetch error:', error);
        // Throw sanitized error for UI
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching && actorInitStatus === 'ready',
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    actorInitStatus,
    actorInitError,
  };
}

export function useCreateUserProfile() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.createUserProfile(profile);
      } catch (error) {
        console.error('Create profile error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.saveCallerUserProfile(profile);
      } catch (error) {
        console.error('Save profile error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ========== Onboarding Queries ==========

export function useGetOnboardingAnswers() {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<OnboardingAnswers | null>({
    queryKey: ['onboardingAnswers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getOnboardingAnswers();
      } catch (error) {
        console.error('Get onboarding answers error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetOnboardingAnswers() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: OnboardingAnswers) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.setOnboardingAnswers(answers);
      } catch (error) {
        console.error('Set onboarding answers error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers'] });
    },
  });
}

// ========== Item Queries ==========

export function useGetBuySellItems() {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<BuySellItem[]>({
    queryKey: ['buySellItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getBuySellItems();
      } catch (error) {
        console.error('Get buy/sell items error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetRentalItems() {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<RentalItem[]>({
    queryKey: ['rentalItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getRentalItems();
      } catch (error) {
        console.error('Get rental items error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetLostFoundItems() {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<LostFoundItem[]>({
    queryKey: ['lostFoundItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getLostFoundItems();
      } catch (error) {
        console.error('Get lost/found items error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMinimalItems() {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<MinimalItem[]>({
    queryKey: ['minimalItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.toMinimalItemList();
      } catch (error) {
        console.error('Get minimal items error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

// ========== Item Mutations ==========

export function useAddItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      section,
      title,
      description,
      price,
      dailyPrice,
      condition,
      category,
      location,
      images,
      storageBlobs,
    }: {
      section: Variant_found_lost_rent_buySell;
      title: string;
      description: string;
      price?: bigint;
      dailyPrice?: bigint;
      condition?: string;
      category?: string;
      location?: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.addItem(
          section,
          title,
          description,
          price ?? null,
          dailyPrice ?? null,
          condition ?? null,
          category ?? null,
          location ?? null,
          images,
          storageBlobs
        );
      } catch (error) {
        console.error('Add item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function useAddBuySellItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      price,
      condition,
      category,
      images,
      storageBlobs,
      isFromSellSection,
    }: {
      title: string;
      description: string;
      price: bigint;
      condition: string;
      category: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
      isFromSellSection: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.addBuySellItem(
          title,
          description,
          price,
          condition,
          category,
          images,
          storageBlobs,
          isFromSellSection
        );
      } catch (error) {
        console.error('Add buy/sell item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function useListForRent() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      dailyPrice,
      condition,
      category,
      images,
      storageBlobs,
    }: {
      title: string;
      description: string;
      dailyPrice: bigint;
      condition: string;
      category: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.listForRent(
          title,
          description,
          dailyPrice,
          condition,
          category,
          images,
          storageBlobs
        );
      } catch (error) {
        console.error('List for rent error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function usePostLostItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      location,
      images,
      storageBlobs,
    }: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.postLostItem(
          title,
          description,
          location,
          images,
          storageBlobs
        );
      } catch (error) {
        console.error('Post lost item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function usePostFoundItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      location,
      images,
      storageBlobs,
    }: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.postFoundItem(
          title,
          description,
          location,
          images,
          storageBlobs
        );
      } catch (error) {
        console.error('Post found item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteItem(itemId);
      } catch (error) {
        console.error('Delete item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function useDeleteLostFoundItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteLostFoundItem(itemId);
      } catch (error) {
        console.error('Delete lost/found item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['minimalItems'] });
    },
  });
}

export function useMarkAsRecovered() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.markAsRecovered(itemId);
      } catch (error) {
        console.error('Mark as recovered error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}
