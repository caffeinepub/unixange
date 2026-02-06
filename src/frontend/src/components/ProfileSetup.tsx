import { useState, ReactNode, useEffect } from 'react';
import { useGetCallerUserProfile, useCreateUserProfile, useGetOnboardingAnswers, useSetOnboardingAnswers } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isValidJainUniversityEmail, getUniversityEmailError } from '@/utils/universityEmail';
import { AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import AuthResolutionErrorScreen from './AuthResolutionErrorScreen';

interface ProfileSetupProps {
  children: ReactNode;
}

type OnboardingStep = 'profile' | 'questions';

export default function ProfileSetup({ children }: ProfileSetupProps) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched,
    error: profileError,
    refetch: refetchProfile
  } = useGetCallerUserProfile();
  
  const { data: onboardingAnswers, isFetched: onboardingFetched } = useGetOnboardingAnswers();
  const createProfile = useCreateUserProfile();
  const setOnboardingAnswers = useSetOnboardingAnswers();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('Jain University');
  const [emailError, setEmailError] = useState('');
  
  const [year, setYear] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('profile');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Detect timeout errors
  const isTimeout = profileError?.message?.toLowerCase().includes('timeout') || 
                    profileError?.message?.toLowerCase().includes('timed out');

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (!isValidJainUniversityEmail(email)) {
      const error = getUniversityEmailError(email);
      setEmailError(error);
      toast.error(error);
      return;
    }

    try {
      await createProfile.mutateAsync({ 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        university: university.trim() 
      });
      toast.success('Profile created successfully!');
      setOnboardingStep('questions');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      const errorMessage = error?.message || 'Failed to create profile';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('jainuniversity.ac.in') || 
          errorMessage.toLowerCase().includes('unauthorized')) {
        setEmailError('Email must be from @jainuniversity.ac.in domain or be an approved admin email');
      }
    }
  };

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!year.trim()) {
      toast.error('Please enter your year of study');
      return;
    }

    if (!city.trim()) {
      toast.error('Please enter your city');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your address');
      return;
    }

    try {
      await setOnboardingAnswers.mutateAsync({
        year: year.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      toast.success('Welcome to UniXange! Your profile is complete.');
      setShowOnboarding(false);
      // Invalidate queries to refresh the app state
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers'] });
    } catch (error: any) {
      console.error('Error saving onboarding answers:', error);
      toast.error(error?.message || 'Failed to save onboarding information');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRetry = () => {
    refetchProfile();
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

  // Show timeout error screen
  if (isTimeout && profileFetched) {
    return (
      <AuthResolutionErrorScreen
        variant="timeout"
        onRetry={handleRetry}
        onLogout={handleLogout}
      />
    );
  }

  // Show general error screen for other errors
  if (profileError && profileFetched && !isTimeout) {
    return (
      <AuthResolutionErrorScreen
        variant="error"
        errorMessage={profileError.message}
        onRetry={handleRetry}
        onLogout={handleLogout}
      />
    );
  }

  // Authenticated but profile check not complete yet - show loading (max 15s due to timeout)
  if (profileLoading || !profileFetched) {
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
        <AuthResolutionErrorScreen
          variant="access-denied"
          email={userProfile.email}
          onLogout={handleLogout}
        />
      );
    }

    // Check if onboarding questions are complete
    if (onboardingFetched && onboardingAnswers) {
      const hasCompletedOnboarding = 
        onboardingAnswers.year.trim() !== '' &&
        onboardingAnswers.city.trim() !== '' &&
        onboardingAnswers.address.trim() !== '';
      
      if (!hasCompletedOnboarding) {
        // Show onboarding questions if not completed
        if (!showOnboarding) {
          setShowOnboarding(true);
          setOnboardingStep('questions');
        }
      } else {
        // Valid profile with completed onboarding - render app
        return <>{children}</>;
      }
    } else if (onboardingFetched && !onboardingAnswers) {
      // No onboarding answers exist, show questions
      if (!showOnboarding) {
        setShowOnboarding(true);
        setOnboardingStep('questions');
      }
    } else {
      // Still loading onboarding answers
      return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-lg text-foreground/70">Loading your profile...</p>
          </div>
        </div>
      );
    }
  }

  // No profile exists - automatically start profile creation
  if (!userProfile && profileFetched) {
    if (!showOnboarding) {
      setShowOnboarding(true);
      setOnboardingStep('profile');
    }
  }

  // Render onboarding dialog
  return (
    <>
      <Dialog open={showOnboarding} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          {onboardingStep === 'profile' ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Profile</DialogTitle>
                <DialogDescription>
                  Please provide your Jain University information to get started
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                  {createProfile.isPending ? 'Creating Profile...' : 'Continue'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Tell Us More About You</DialogTitle>
                <DialogDescription>
                  Help us personalize your experience with a few more details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleQuestionsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Study</Label>
                  <Input
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2nd Year, Final Year"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Bangalore"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your current address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={setOnboardingAnswers.isPending}>
                  {setOnboardingAnswers.isPending ? 'Saving...' : 'Complete Setup'}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
      {!showOnboarding && children}
    </>
  );
}
