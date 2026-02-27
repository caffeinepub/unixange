import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Menu, X, ShoppingBag, Home, Tag, Package, Search } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileAvatarMenu from './ProfileAvatarMenu';
import LoginModal from './LoginModal';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Buy', path: '/buy', icon: ShoppingBag },
  { label: 'Sell', path: '/sell', icon: Tag },
  { label: 'Rent', path: '/rent', icon: Package },
  { label: 'Lost & Found', path: '/lost-found', icon: Search },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-header-cream shadow-sm">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
            >
              <img src="/assets/generated/unixange-logo-transparent.dim_200x200.png" alt="UniXange" className="h-8 w-8 object-contain" />
              <span className="text-foreground">Uni<span className="text-primary">Xange</span></span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate({ to: path })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Auth Controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <ProfileAvatarMenu />
              ) : (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-header-cream">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => { navigate({ to: path }); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                {isAuthenticated ? (
                  <ProfileAvatarMenu />
                ) : (
                  <button
                    onClick={() => { setLoginModalOpen(true); setMobileOpen(false); }}
                    className="w-full px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
