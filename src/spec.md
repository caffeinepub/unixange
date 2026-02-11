# Specification

## Summary
**Goal:** Add a polling-based in-app messaging feature so customers can contact listing owners through chat, with an inbox and conversation threads integrated into existing marketplace flows.

**Planned changes:**
- Implement backend Candid methods to create/fetch conversations per listing + counterpart, send messages, fetch messages with pagination/limits for polling, and list the caller’s conversations.
- Enforce access control so only the two participants (and existing admins, if applicable) can read/send messages, and apply existing campus-membership/authorization rules (no anonymous messaging).
- Store chat data with deterministic ordering/timestamps and add upgrade-safe persistence if new stable state is required.
- Add frontend messages UI: an inbox route listing conversations (last message preview + timestamp) and a thread screen that polls for updates via React Query and supports sending messages.
- Wire `frontend/src/components/ItemCard.tsx` “Contact” action to open (or create then open) the correct listing chat thread; hide/disable Contact for the listing owner viewing their own listing.
- Update the existing `/contact` page to remain support/feedback-focused while adding a clear authenticated entry point to the in-app messages inbox (prompting login if not authenticated).
- Apply a cohesive, marketplace-aligned visual theme across the new chat screens, consistent with existing Tailwind/Shadcn styling and light/dark mode behavior (avoid introducing a new blue/purple-dominant palette).

**User-visible outcome:** Authenticated users can open an inbox, view and poll conversation threads, and send messages to listing owners from the per-item “Contact” action; the Contact page continues to show support emails and now links to in-app messages for contacting sellers.
