# Specification

## Summary
**Goal:** Improve frontend resilience and clarity when profile loading fails due to a stopped backend canister, and remove the createActor configuration warning.

**Planned changes:**
- Detect Internet Computer “canister is stopped” rejection errors during authenticated actor initialization (including `_initializeAccessControlWithSecret`) and show a clear, user-friendly error in the UI instead of a generic failure.
- Include the canister ID from the rejection payload in the displayed error message (or in a clearly labeled details section), while keeping existing Retry and Logout actions unchanged.
- Update error sanitization/formatting to map stopped-canister errors to stable English UI text, while still logging raw error details to the browser console.
- Adjust actor creation to pass only one of `agent` or `agentOptions` to `createActorWithConfig` to eliminate the runtime warning.
- Consolidate/guard authenticated actor initialization to prevent duplicated access-control initialization calls so `_initializeAccessControlWithSecret` runs at most once per session init (unless the user retries).

**User-visible outcome:** If the backend canister is stopped, users see a specific “backend unavailable (canister stopped)” message with the canister ID and can Retry or Logout; normal login/profile load no longer emits the agent/agentOptions warning and avoids redundant initialization calls.
