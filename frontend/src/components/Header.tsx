import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { ShoppingBag, Home, Tag, Package, Search, Menu, X, HelpCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginModal from './LoginModal';
import ProfileAvatarMenu from './ProfileAvatarMenu';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Buy', path: '/buy', icon: ShoppingBag },
  { label: 'Sell', path: '/sell', icon: Tag },
  { label: 'Rent', path: '/rent', icon: Package },
  { label: 'Lost & Found', path: '/lost-found', icon: HelpCircle },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!identity;
  const currentPath = location.pathname;

  const handleNavClick = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/buy' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <img
                src="/assets/generated/unixange-logo-transparent.dim_200x200.png"
                alt="UniXange"
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold text-foreground tracking-tight">
                Uni<span className="text-primary">Xange</span>
              </span>
            </button>

            {/* Search bar - desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
                />
              </div>
            </form>

            {/* Desktop auth controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <ProfileAvatarMenu />
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  Login / Sign up
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1 pb-2">
            {navLinks.map(({ label, path, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavClick(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-primary bg-badge-bg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            {/* Mobile search */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </form>
            </div>

            {/* Mobile nav links */}
            <nav className="px-4 pb-3 space-y-1">
              {navLinks.map(({ label, path, icon: Icon }) => {
                const isActive = currentPath === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile auth */}
            <div className="px-4 pb-4 border-t border-border pt-3">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Logged in</span>
                  <ProfileAvatarMenu />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
