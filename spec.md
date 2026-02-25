# Specification

## Summary
**Goal:** Add automatic dark/light mode theme switching that follows the user's system preference.

**Planned changes:**
- Configure Tailwind CSS to use the `class` dark mode strategy in `tailwind.config.js`
- Define dark mode CSS variables (colors, backgrounds, borders, text) under a `.dark` selector in `index.css`
- Create/update a ThemeProvider in `App.tsx` that reads `prefers-color-scheme` on load, applies the `dark` class to `<html>`, and listens for real-time system preference changes
- Update all pages and components (Header, Footer, Homepage, BuySection, RentSection, SellSection, LostFoundSection, About, Contact, Privacy, Terms, ItemCard, AddItemModal, DeleteConfirmationModal, LoginModal, ProfileSetup, ProfileAvatarMenu, FloatingAddButton, AuthResolutionErrorScreen) with Tailwind `dark:` variants for backgrounds, text, borders, cards, modals, and inputs

**User-visible outcome:** The app automatically switches between the existing beige/white light theme and a dark theme based on the user's OS/system preference, updating in real-time without a page reload.
