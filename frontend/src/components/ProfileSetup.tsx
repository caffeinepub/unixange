import { useState, ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateUserProfile, useSetOnboardingAnswers, useGetOnboardingAnswers } from '../hooks/useQueries';
import { isValidUniversityEmail, getUniversityEmailError } from '../utils/universityEmail';
import { Loader2, GraduationCap } from 'lucide-react';
import LoginModal from './LoginModal';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileSetupProps {
  children: ReactNode;
}

export default function ProfileSetup({ children }: ProfileSetupProps) {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: onboardingAnswers, isLoading: onboardingLoading } = useGetOnboardingAnswers();
  const createProfile = useCreateUserProfile();
  const setOnboarding = useSetOnboardingAnswers();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [step, setStep] = useState<'profile' | 'onboarding'>('profile');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university] = useState('Jain University');
  const [emailError, setEmailError] = useState('');

  // Onboarding form state
  const [year, setYear] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showOnboarding = isAuthenticated && !onboardingLoading && userProfile !== null && onboardingAnswers !== null && onboardingAnswers?.year === '';

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = getUniversityEmailError(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    try {
      await createProfile.mutateAsync({ name, email, university });
      setStep('onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('domain') || msg.includes('jainuniversity')) {
        setEmailError('Only @jainuniversity.ac.in email addresses are allowed.');
      }
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setOnboarding.mutateAsync({ year, address, city });
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Loading state
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading UniXange...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show app with login modal available
  if (!isAuthenticated) {
    return (
      <>
        {children}
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  // Profile setup
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-marketplace-beige flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Welcome to UniXange! Please set up your profile to get started.
          </p>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">University Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                required
                placeholder="yourname@jainuniversity.ac.in"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${emailError ? 'border-destructive' : 'border-input'}`}
              />
              {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">University</label>
              <input
                type="text"
                value={university}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={createProfile.isPending}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Profile
            </button>
            <button type="button" onClick={handleLogout} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Onboarding
  if (showOnboarding && step === 'onboarding') {
    return (
      <div className="min-h-screen bg-marketplace-beige flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Quick Setup</h2>
          <p className="text-muted-foreground text-sm mb-6">Just a few more details to personalize your experience.</p>
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year of Study</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Your address"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Your city"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={setOnboarding.isPending}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {setOnboarding.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
