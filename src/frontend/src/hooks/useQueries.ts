import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorInitGuard } from './useActorInitGuard';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  BuySellItem,
  RentalItem,
  LostFoundItem,
  UserProfile,
  OnboardingAnswers,
  MinimalItem,
  Variant_found_lost_rent_buySell,
  NewConversation,
  NewMessage,
  Message,
  UserId,
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

// ========== Item Mutations ==========

export function useAddBuySellItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
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
          params.title,
          params.description,
          params.price,
          params.condition,
          params.category,
          params.images,
          params.storageBlobs,
          params.isFromSellSection
        );
      } catch (error) {
        console.error('Add buy/sell item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
    },
  });
}

export function useListForRent() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
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
          params.title,
          params.description,
          params.dailyPrice,
          params.condition,
          params.category,
          params.images,
          params.storageBlobs
        );
      } catch (error) {
        console.error('List for rent error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });
}

export function usePostLostItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.postLostItem(
          params.title,
          params.description,
          params.location,
          params.images,
          params.storageBlobs
        );
      } catch (error) {
        console.error('Post lost item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}

export function usePostFoundItem() {
  const { actor } = useActorInitGuard();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.postFoundItem(
          params.title,
          params.description,
          params.location,
          params.images,
          params.storageBlobs
        );
      } catch (error) {
        console.error('Post found item error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
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
    },
  });
}

// ========== Chat Queries ==========

export function useStartConversation() {
  const { actor } = useActorInitGuard();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (params: { listingOwnerId: UserId; initialMessage: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');
      
      try {
        const callerPrincipal = identity.getPrincipal();
        const newConversation: NewConversation = {
          participants: [callerPrincipal, params.listingOwnerId],
          message: {
            sender: callerPrincipal,
            content: params.initialMessage,
          },
        };
        await actor.startConversation(newConversation);
        
        // Generate conversation ID (same logic as backend)
        const [p1, p2] = [callerPrincipal.toText(), params.listingOwnerId.toText()].sort();
        return `${p1}|${p2}`;
      } catch (error) {
        console.error('Start conversation error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
  });
}

export function useGetMessages(conversationId: string | null, enabled: boolean = true) {
  const { actor, isInitializing: actorFetching } = useActorInitGuard();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) throw new Error('Actor or conversation ID not available');
      try {
        return await actor.getMessages(conversationId, BigInt(0), BigInt(100));
      } catch (error) {
        console.error('Get messages error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    enabled: !!actor && !actorFetching && !!conversationId && enabled,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActorInitGuard();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { conversationId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');
      
      try {
        const newMessage: NewMessage = {
          sender: identity.getPrincipal(),
          content: params.content,
        };
        await actor.sendMessage(params.conversationId, newMessage);
      } catch (error) {
        console.error('Send message error:', error);
        throw new Error(sanitizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
}
