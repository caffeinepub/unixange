# Specification

## Summary
**Goal:** Fully rebuild the UniXange Campus Marketplace — both backend (Motoko) and frontend (React) — from scratch as a complete redeployment, restoring all features and fixing the stopped canister/service unavailable state shown in the screenshot.

**Planned changes:**
- Rebuild the entire Motoko backend actor with data types and CRUD operations for buy/sell items, rental items, and lost & found items
- Implement user profile management with @jainuniversity.ac.in email validation and admin allowlist bypass
- Rebuild all React frontend pages: Homepage (hero, category browse, recent listings), Buy, Sell, Rent, Lost & Found, Item Detail, About, Contact, Privacy, and Terms
- Implement Internet Identity authentication gated to @jainuniversity.ac.in domain, with login modal showing login/signup, loading, and access-denied states
- Apply a beige and black OLX-inspired visual theme consistently across all pages and components
- Add a profile avatar dropdown in the header showing user name, email, and university with a logout action, visible on desktop and mobile
- Implement an Add Item modal form for authenticated users to post listings across all categories, with fields for title, description (with AI-generated description support), category, condition, ₹ price, image upload, and WhatsApp contact number
- Implement a basic in-app chat feature allowing authenticated users to message each other about listings

**User-visible outcome:** Users can visit the UniXange marketplace, log in with their Jain University email via Internet Identity, browse and post buy/sell/rent and lost & found listings, chat with other users about items, and manage their profile — all within a beige and black themed interface.
