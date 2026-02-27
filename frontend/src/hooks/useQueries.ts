import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BuySellItem, RentalItem, LostFoundItem, UserProfile, OnboardingAnswers } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetOnboardingAnswers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OnboardingAnswers | null>({
    queryKey: ['onboardingAnswers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOnboardingAnswers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetOnboardingAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: OnboardingAnswers) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setOnboardingAnswers(answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers'] });
    },
  });
}

export function useGetBuySellItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuySellItem[]>({
    queryKey: ['buySellItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuySellItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBuySellItem(itemId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuySellItem | null>({
    queryKey: ['buySellItem', itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return null;
      return actor.getBuySellItem(itemId);
    },
    enabled: !!actor && !actorFetching && itemId !== null,
  });
}

export function useGetRentalItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RentalItem[]>({
    queryKey: ['rentalItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRentalItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetRentalItem(itemId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RentalItem | null>({
    queryKey: ['rentalItem', itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return null;
      return actor.getRentalItem(itemId);
    },
    enabled: !!actor && !actorFetching && itemId !== null,
  });
}

export function useGetLostFoundItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LostFoundItem[]>({
    queryKey: ['lostFoundItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLostFoundItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetLostFoundItem(itemId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LostFoundItem | null>({
    queryKey: ['lostFoundItem', itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return null;
      return actor.getLostFoundItem(itemId);
    },
    enabled: !!actor && !actorFetching && itemId !== null,
  });
}

export function useAddBuySellItem() {
  const { actor } = useActor();
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
      whatsappNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBuySellItem(
        params.title,
        params.description,
        params.price,
        params.condition,
        params.category,
        params.images,
        params.storageBlobs,
        params.isFromSellSection,
        params.whatsappNumber
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
    },
  });
}

export function useListForRent() {
  const { actor } = useActor();
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
      whatsappNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.listForRent(
        params.title,
        params.description,
        params.dailyPrice,
        params.condition,
        params.category,
        params.images,
        params.storageBlobs,
        params.whatsappNumber
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });
}

export function usePostLostItem() {
  const { actor } = useActor();
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
      return actor.postLostItem(params.title, params.description, params.location, params.images, params.storageBlobs);
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
    mutationFn: async (params: {
      title: string;
      description: string;
      location: string;
      images: Uint8Array[];
      storageBlobs: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.postFoundItem(params.title, params.description, params.location, params.images, params.storageBlobs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buySellItems'] });
      queryClient.invalidateQueries({ queryKey: ['rentalItems'] });
    },
  });
}

export function useDeleteLostFoundItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLostFoundItem(itemId);
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
      return actor.markAsRecovered(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFoundItems'] });
    },
  });
}
