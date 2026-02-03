# Specification

## Summary
**Goal:** Fix the authenticated login + profile onboarding flow so users never get stuck on “Loading your profile...” and can always deterministically reach either the app or profile creation.

**Planned changes:**
- Update the post-auth flow to no longer depend on `authIntent` being present to resolve; use profile existence (`exists` vs `null`) to route users to the app or to profile creation.
- Harden ProfileSetup gate state handling to ensure all authentication/profile states lead to a terminal UI (unauthenticated, loading, profile exists, no profile, invalid email domain) with no redirect loops.
- Adjust React Query profile fetching and actor/identity initialization so profile calls run only when authenticated and an authenticated actor is ready, preventing transient “Unauthorized” errors from causing stuck loading or error loops.
- Ensure logout reliably clears profile/auth state and returns users to the unauthenticated welcome screen.

**User-visible outcome:** After Internet Identity login (including after refresh), users either enter the app immediately if a profile exists, or are shown a working profile creation flow if not. Users with an invalid email domain see an access-denied screen with a working logout, and no flow gets stuck in loading or loops.
