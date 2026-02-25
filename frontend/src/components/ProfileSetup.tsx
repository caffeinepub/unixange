import React, { useState } from 'react';
import { User, Mail, Building2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { isValidJainUniversityEmail } from '../utils/universityEmail';
import AuthResolutionErrorScreen from './AuthResolutionErrorScreen';
import { useActorInitGuard } from '../hooks/useActorInitGuard';

export default function ProfileSetup() {
  const { identity, isInitializing: identityInitializing } = useInternetIdentity();
  const { status: actorStatus, error: actorError, retry: retryActor } = useActorInitGuard();

  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('Jain University');
  const [emailError, setEmailError] = useState('');

  const isActorError = actorStatus === 'error';
  const isActorTimeout = actorStatus === 'timeout';
  const isActorReady = actorStatus === 'ready';

  const showProfileSetup =
    isAuthenticated &&
    !identityInitializing &&
    isActorReady &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val && !isValidJainUniversityEmail(val)) {
      setEmailError('Please use your @jainuniversity.ac.in email address.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || !name.trim() || !email.trim()) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim(), email: email.trim(), university });
    } catch {
      // error handled by mutation state
    }
  };

  if (!isAuthenticated || identityInitializing) return null;

  if (isActorTimeout) {
    return (
      <AuthResolutionErrorScreen
        variant="timeout"
        onRetry={retryActor}
      />
    );
  }

  if (isActorError) {
    return (
      <AuthResolutionErrorScreen
        variant="error"
        message={actorError?.message}
        onRetry={retryActor}
      />
    );
  }

  if (!showProfileSetup) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md bg-card text-card-foreground border-border [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your profile to start using UniXange marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <User className="inline h-4 w-4 mr-1 text-muted-foreground" />
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Mail className="inline h-4 w-4 mr-1 text-muted-foreground" />
              University Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              placeholder="you@jainuniversity.ac.in"
              className={`w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground ${
                emailError ? 'border-destructive' : 'border-border'
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>
            )}
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Building2 className="inline h-4 w-4 mr-1 text-muted-foreground" />
              University
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Jain University"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Error */}
          {saveProfile.isError && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {(saveProfile.error as Error)?.message?.includes('university email')
                  ? 'Please use a valid @jainuniversity.ac.in email address.'
                  : 'Failed to save profile. Please try again.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saveProfile.isPending || !!emailError || !name.trim() || !email.trim()}
            className="w-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Setup
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
