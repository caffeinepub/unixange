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

const routeTree = rootRoute.addChildren([indexRoute, buyRoute, sellRoute, rentRoute, lostFoundRoute]);

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
