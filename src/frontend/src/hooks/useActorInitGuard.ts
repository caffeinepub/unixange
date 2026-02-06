import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { sanitizeErrorMessage } from '../utils/sanitizeErrorMessage';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';
import { withTimeout } from '../utils/promiseTimeout';
import { isActorInitTimeout } from '../utils/actorInitErrors';
import type { backendInterface } from '../backend';

const ACTOR_INIT_TIMEOUT = 20000; // 20 seconds
const ACTOR_GUARD_QUERY_KEY = 'actorGuard';

export type ActorInitStatus = 'initializing' | 'ready' | 'error' | 'timeout';

interface ActorInitGuardResult {
  actor: backendInterface | null;
  isInitializing: boolean;
  status: ActorInitStatus;
  error: Error | null;
  retry: () => void;
}

/**
 * Enhanced actor initialization hook that detects failures and timeouts.
 * Provides explicit error states and in-app retry without page reload.
 * This is the single source of truth for authenticated actor initialization.
 */
export function useActorInitGuard(): ActorInitGuardResult {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorGuardQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_GUARD_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      // Wrap authenticated actor creation + access control init in timeout
      try {
        const actor = await withTimeout(
          (async () => {
            // Create actor with identity (pass only agentOptions, not agent)
            const actorInstance = await createActorWithConfig({
              agentOptions: {
                identity,
              },
            });
            
            // Initialize access control
            const adminToken = getSecretParameter('caffeineAdminToken') || '';
            await actorInstance._initializeAccessControlWithSecret(adminToken);
            
            return actorInstance;
          })(),
          ACTOR_INIT_TIMEOUT,
          'Actor initialization timed out after 20 seconds'
        );
        return actor;
      } catch (error) {
        // Log raw error to console for debugging
        console.error('Actor initialization failed:', error);
        throw error;
      }
    },
    staleTime: Infinity,
    enabled: true,
    retry: false, // Don't auto-retry, let user explicitly retry
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorGuardQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_GUARD_QUERY_KEY) && !query.queryKey.includes('actor');
        },
      });
    }
  }, [actorGuardQuery.data, queryClient]);

  // Determine status
  let status: ActorInitStatus;
  if (actorGuardQuery.error) {
    status = isActorInitTimeout(actorGuardQuery.error) ? 'timeout' : 'error';
  } else if (actorGuardQuery.data) {
    status = 'ready';
  } else {
    status = 'initializing';
  }

  const retry = () => {
    // In-app retry: refetch actor and reset dependent queries
    queryClient.resetQueries({ queryKey: [ACTOR_GUARD_QUERY_KEY] });
    actorGuardQuery.refetch();
  };

  // Sanitize error message for UI display
  const sanitizedError = actorGuardQuery.error
    ? new Error(sanitizeErrorMessage(actorGuardQuery.error))
    : null;

  return {
    actor: actorGuardQuery.data || null,
    isInitializing: status === 'initializing',
    status,
    error: sanitizedError,
    retry,
  };
}
