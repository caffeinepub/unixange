import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { setAuthIntent, clearAuthIntent } from '@/utils/authIntent';
import ProfileAvatarMenu from '@/components/ProfileAvatarMenu';

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      setAuthIntent('login');
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      clearAuthIntent();
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => handleLogin(), 300);
      }
    }
  };

  const handleSignup = async () => {
    try {
      setAuthIntent('signup');
      await login();
    } catch (error: any) {
      console.error('Sign up error:', error);
      clearAuthIntent();
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => handleSignup(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    clearAuthIntent();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <header 
      className={`sticky top-0 z-50 border-b transition-marketplace ${
        scrolled 
          ? 'border-border bg-card/95 backdrop-blur-lg shadow-marketplace' 
          : 'border-border/60 bg-card/90 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="shrink-0 transition-marketplace hover:opacity-70"
          >
            <span className="text-xl font-bold tracking-tight text-primary">UniXange</span>
          </button>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border-border bg-background pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </form>

          {/* Right side - Desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <ProfileAvatarMenu userProfile={userProfile} isLoading={profileLoading} />
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  disabled={disabled}
                  variant="outline"
                  size="sm"
                  className="rounded-md px-4 font-medium transition-marketplace"
                >
                  {disabled ? 'Logging in...' : 'Login'}
                </Button>
                <Button
                  onClick={handleSignup}
                  disabled={disabled}
                  variant="default"
                  size="sm"
                  className="rounded-md px-4 font-medium transition-marketplace"
                >
                  {disabled ? 'Signing up...' : 'Sign up'}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/60 py-4 lg:hidden">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Mobile profile section */}
                  <div className="mb-4 rounded-md border border-border bg-accent px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/assets/generated/profile-icon-transparent.dim_32x32.png" 
                        alt="Profile" 
                        className="h-10 w-10 rounded-full border-2 border-border"
                      />
                      <div className="flex-1 min-w-0">
                        {profileLoading ? (
                          <>
                            <p className="text-sm font-semibold text-foreground">Loading...</p>
                            <p className="text-xs text-muted-foreground truncate">Please wait</p>
                          </>
                        ) : userProfile ? (
                          <>
                            <p className="text-sm font-semibold text-foreground truncate">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                            {userProfile.university && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{userProfile.university}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-foreground">Account</p>
                            <p className="text-xs text-muted-foreground">Profile loading...</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Mobile logout button */}
                  <Button
                    onClick={handleLogout}
                    disabled={disabled}
                    variant="outline"
                    className="w-full justify-start rounded-md font-medium text-destructive hover:text-destructive"
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleLogin}
                    disabled={disabled}
                    variant="outline"
                    className="w-full justify-start rounded-md font-medium"
                  >
                    {disabled ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button
                    onClick={handleSignup}
                    disabled={disabled}
                    variant="default"
                    className="w-full justify-start rounded-md font-medium"
                  >
                    {disabled ? 'Signing up...' : 'Sign up'}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Category navigation */}
        <div className="border-t border-border/60">
          <nav className="flex h-12 items-center gap-6 overflow-x-auto">
            <button
              onClick={() => navigate({ to: '/' })}
              className={`shrink-0 text-sm font-medium transition-marketplace ${
                routerState.location.pathname === '/' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate({ to: '/buy' })}
              className={`shrink-0 text-sm font-medium transition-marketplace ${
                routerState.location.pathname === '/buy' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => navigate({ to: '/rent' })}
              className={`shrink-0 text-sm font-medium transition-marketplace ${
                routerState.location.pathname === '/rent' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => navigate({ to: '/sell' })}
              className={`shrink-0 text-sm font-medium transition-marketplace ${
                routerState.location.pathname === '/sell' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => navigate({ to: '/lost-found' })}
              className={`shrink-0 text-sm font-medium transition-marketplace ${
                routerState.location.pathname === '/lost-found' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Lost & Found
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="border-t border-border/60 bg-card px-4 py-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border-border bg-background pl-10 pr-4 text-sm font-medium"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
