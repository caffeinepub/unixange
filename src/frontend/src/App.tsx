import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Homepage from '@/pages/Homepage';
import BuySection from '@/pages/BuySection';
import SellSection from '@/pages/SellSection';
import RentSection from '@/pages/RentSection';
import LostFoundSection from '@/pages/LostFoundSection';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import MessagesInbox from '@/pages/MessagesInbox';
import MessagesThread from '@/pages/MessagesThread';
import ProfileSetup from '@/components/ProfileSetup';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ProfileSetup>
          <Outlet />
        </ProfileSetup>
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const buyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy',
  component: BuySection,
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sell',
  component: SellSection,
});

const rentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rent',
  component: RentSection,
});

const lostFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lost-found',
  component: LostFoundSection,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: Terms,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesInbox,
});

const messagesThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$conversationId',
  component: MessagesThread,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  buyRoute,
  sellRoute,
  rentRoute,
  lostFoundRoute,
  aboutRoute,
  contactRoute,
  termsRoute,
  privacyRoute,
  messagesRoute,
  messagesThreadRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
