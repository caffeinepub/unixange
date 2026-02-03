import { useState, ReactNode, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isValidJainUniversityEmail, getUniversityEmailError } from '@/utils/universityEmail';
import { AlertCircle, XCircle } from 'lucide-react';
import { getAuthIntent, clearAuthIntent } from '@/utils/authIntent';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileSetupProps {
  children: ReactNode;
}

export default function ProfileSetup({ children }: ProfileSetupProps) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('Jain University');
  const [emailError, setEmailError] = useState('');
  const [authIntent, setAuthIntentState] = useState<'login' | 'signup' | null>(null);

  // Fetch auth intent once after authentication
  useEffect(() => {
    if (isAuthenticated && authIntent === null) {
      const intent = getAuthIntent();
      setAuthIntentState(intent);
    }
  }, [isAuthenticated, authIntent]);

  // Clear intent on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthIntentState(null);
      clearAuthIntent();
    }
  }, [isAuthenticated]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your university email');
      return;
    }

    if (!university.trim()) {
      toast.error('Please enter your university name');
      return;
    }

    // Validate university email domain
    if (!isValidJainUniversityEmail(email)) {
      const error = getUniversityEmailError(email);
      setEmailError(error);
      toast.error(error);
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        university: university.trim() 
      });
      toast.success('Profile created successfully! Welcome to UniXange.');
      clearAuthIntent();
      setAuthIntentState(null);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error?.message || 'Failed to create profile';
      toast.error(errorMessage);
      
      // If backend rejects the email, show inline error too
      if (errorMessage.includes('jainuniversity.ac.in')) {
        setEmailError('Email must be from @jainuniversity.ac.in domain');
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    clearAuthIntent();
    setAuthIntentState(null);
    queryClient.clear();
  };

  // Not authenticated - show welcome screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Welcome to UniXange</h2>
          <p className="mt-4 text-lg text-foreground/70">
            Please login or sign up to access the university exchange platform
          </p>
        </div>
      </div>
    );
  }

  // Authenticated but profile check not complete yet - show loading
  // Only block on profile loading, not on missing authIntent
  if (profileLoading || !isFetched) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg text-foreground/70">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Profile exists - validate email domain
  if (userProfile) {
    if (!isValidJainUniversityEmail(userProfile.email)) {
      return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
          <div className="max-w-md rounded-lg border-2 border-destructive bg-card p-8 text-center shadow-lg">
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-4 text-base text-foreground/80">
              Your profile email <span className="font-semibold">{userProfile.email}</span> is not a valid Jain University email address.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Only <span className="font-semibold">@jainuniversity.ac.in</span> email addresses are allowed to access UniXange.
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="mt-6 w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      );
    }

    // Valid profile - render app
    return <>{children}</>;
  }

  // No profile exists
  // If intent is 'login', block access and show error
  if (authIntent === 'login') {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="max-w-md rounded-lg border-2 border-destructive bg-card p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">No Profile Found</h2>
          <p className="mt-4 text-base text-foreground/80">
            You don't have a profile yet. Please use <span className="font-semibold">Sign up</span> to create your account.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you already have an account, make sure you're using the correct Internet Identity.
          </p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-6 w-full"
          >
            Logout and Sign up
          </Button>
        </div>
      </div>
    );
  }

  // Intent is 'signup' or missing - show profile creation modal
  // If intent is missing, treat as signup (allow profile creation)
  const showProfileSetup = authIntent === 'signup' || authIntent === null;

  return (
    <>
      <Dialog open={showProfileSetup}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your Jain University information to get started
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john.doe@jainuniversity.ac.in"
                required
                autoComplete="email"
                className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {emailError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{emailError}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Must be a valid @jainuniversity.ac.in email address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Jain University"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {!showProfileSetup && children}
    </>
  );
}
