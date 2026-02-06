# Specification

## Summary
**Goal:** Rebuild the app footer to match the uploaded screenshot’s 3-column layout and spacing while keeping the existing beige/black theme.

**Planned changes:**
- Update the existing footer component to a 3-column desktop layout (brand + short description, “Quick Links” list, “About” heading + short paragraph) that stacks cleanly on mobile.
- Implement “Quick Links” items (Buy, Sell, Rent, Lost & Found) routing to `/buy`, `/sell`, `/rent`, `/lost-found`.
- Replace the footer bottom area with a single centered copyright line: “© {currentYear} UniXange. All Rights Reserved.” and remove the “Built with … caffeine.ai” line.
- Ensure the updated footer remains integrated via the global layout and the frontend builds successfully without touching backend code or immutable frontend files.

**User-visible outcome:** The footer matches the screenshot structure and spacing, retains the beige/black styling, has working quick links, and shows only the simplified UniXange copyright line.
