import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, BuySellItem, RentalItem, LostFoundItem, OnboardingAnswers } from '@/backend';
import { ExternalBlob } from '@/backend';
import { withTimeout } from '@/utils/promiseTimeout';

// Helper function to categorize and format errors
function formatError(error: any): { message: string; category: 'auth' | 'network' | 'validation' | 'server' | 'timeout' } {
  const errorMessage = error?.message || String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      message: 'Request timed out. The network may be slow. Please try again.',
      category: 'timeout',
    };
  }
  
  if (lowerMessage.includes('unauthorized') || 
      lowerMessage.includes('authentication') ||
      lowerMessage.includes('valid university email required') ||
      lowerMessage.includes('only users can')) {
    return {
      message: 'You must be logged in with a valid university profile to perform this action.',
      category: 'auth',
    };
  }
  
  if (lowerMessage.includes('actor not available') || lowerMessage.includes('not initialized')) {
    return {
      message: 'Connection to the backend is not available. Please wait a moment and try again.',
      category: 'network',
    };
  }
  
  if (lowerMessage.includes('required') || lowerMessage.includes('invalid')) {
    return {
      message: errorMessage,
      category: 'validation',
    };
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return {
      message: 'Network error occurred. Please check your connection and try again.',
      category: 'network',
    };
  }
  
  return {
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    category: 'server',
  };
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Wrap the profile fetch with a 15-second timeout
        const profile = await withTimeout(
          actor.getCallerUserProfile(),
          15000,
          'Profile loading timed out after 15 seconds'
        );
        return profile;
      } catch (error: any) {
        const formattedError = formatError(error);
        // Only log non-auth errors to reduce noise during login transitions
        if (formattedError.category !== 'auth') {
          console.error('Error fetching user profile:', formattedError);
        }
        throw new Error(formattedError.message);
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: (failureCount, error: any) => {
      const formattedError = formatError(error);
      // Don't retry auth errors, timeouts, or during actor initialization
      if (formattedError.category === 'auth' || 
          formattedError.category === 'timeout' || 
          formattedError.category === 'network') {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 30000, // Cache for 30 seconds to reduce refetch churn
  });

  return {
    ...query,
    isLoading: (actorFetching || query.isLoading) && isAuthenticated,
    isFetched: !!actor && isAuthenticated && query.isFetched,
  };
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createUserProfile(profile);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error creating user profile:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error saving user profile:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetOnboardingAnswers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<OnboardingAnswers | null>({
    queryKey: ['onboardingAnswers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getOnboardingAnswers();
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error fetching onboarding answers:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });
}

export function useSetOnboardingAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: OnboardingAnswers) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setOnboardingAnswers(answers);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error setting onboarding answers:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers'] });
    },
  });
}

export function useGetBuySellItems() {
  const { actor, isFetching } = useActor();

  return useQuery<BuySellItem[]>({
    queryKey: ['buySellItems'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBuySellItems();
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error fetching buy/sell items:', formattedError);
        // Return empty array for network errors to allow graceful degradation
        if (formattedError.category === 'network') {
          return [];
        }
        throw new Error(formattedError.message);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBuySellItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
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
      
      // Handle empty images gracefully
      const images = data.images.length > 0 ? data.images : [];
      const storageBlobs = data.storageBlobs.length > 0 ? data.storageBlobs : [];
      
      try {
        return await actor.addBuySellItem(
          data.title,
          data.description,
          data.price,
          data.condition,
          data.category,
          images,
          storageBlobs,
          data.isFromSellSection
        );
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error adding buy/sell item:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      // Invalidate both queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteItem(itemId);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error deleting item:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });
}

export function useGetRentalItems() {
  const { actor, isFetching } = useActor();

  return useQuery<RentalItem[]>({
    queryKey: ['rentalItems'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRentalItems();
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error fetching rental items:', formattedError);
        // Return empty array for network errors to allow graceful degradation
        if (formattedError.category === 'network') {
          return [];
        }
        throw new Error(formattedError.message);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListForRent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      dailyPrice: bigint;
      condition: string;
      category: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Handle empty images gracefully
      const images = data.images.length > 0 ? data.images : [];
      const storageBlobs = data.storageBlobs.length > 0 ? data.storageBlobs : [];
      
      try {
        return await actor.listForRent(
          data.title,
          data.description,
          data.dailyPrice,
          data.condition,
          data.category,
          images,
          storageBlobs
        );
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error listing item for rent:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });
}

export function useGetLostFoundItems() {
  const { actor, isFetching } = useActor();

  return useQuery<LostFoundItem[]>({
    queryKey: ['lostFoundItems'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLostFoundItems();
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error fetching lost/found items:', formattedError);
        // Return empty array for network errors to allow graceful degradation
        if (formattedError.category === 'network') {
          return [];
        }
        throw new Error(formattedError.message);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostLostItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Handle empty images gracefully
      const images = data.images.length > 0 ? data.images : [];
      const storageBlobs = data.storageBlobs.length > 0 ? data.storageBlobs : [];
      
      try {
        return await actor.postLostItem(data.title, data.description, data.location, images, storageBlobs);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error posting lost item:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}

export function usePostFoundItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Handle empty images gracefully
      const images = data.images.length > 0 ? data.images : [];
      const storageBlobs = data.storageBlobs.length > 0 ? data.storageBlobs : [];
      
      try {
        return await actor.postFoundItem(data.title, data.description, data.location, images, storageBlobs);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error posting found item:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}

export function useDeleteLostFoundItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteLostFoundItem(itemId);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error deleting lost/found item:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}

export function useMarkAsRecovered() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.markAsRecovered(itemId);
      } catch (error: any) {
        const formattedError = formatError(error);
        console.error('Error marking item as recovered:', formattedError);
        throw new Error(formattedError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}
