import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Homepage from './pages/Homepage';
import BuySection from './pages/BuySection';
import SellSection from './pages/SellSection';
import RentSection from './pages/RentSection';
import LostFoundSection from './pages/LostFoundSection';
import ItemDetail from './pages/ItemDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProfileSetup from './components/ProfileSetup';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('IC0508') || msg.includes('is stopped') || msg.includes('canister')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
    mutations: {
      retry: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <ProfileSetup>
      <Outlet />
    </ProfileSetup>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Homepage });
const buyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/buy', component: BuySection });
const sellRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sell', component: SellSection });
const rentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/rent', component: RentSection });
const lostFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '/lost-found', component: LostFoundSection });
const itemDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/item/$id', component: ItemDetail });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contact', component: Contact });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: Privacy });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: Terms });

const routeTree = rootRoute.addChildren([
  indexRoute,
  buyRoute,
  sellRoute,
  rentRoute,
  lostFoundRoute,
  itemDetailRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
