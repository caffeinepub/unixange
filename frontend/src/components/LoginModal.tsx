import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { setAuthIntent } from '../utils/authIntent';
import { Loader2, ShieldX, GraduationCap } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type View = 'choice' | 'loading' | 'access-denied' | 'error';

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login, loginStatus, isLoggingIn, isLoginError, isLoginSuccess } = useInternetIdentity();
  const [view, setView] = useState<View>('choice');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isLoggingIn) {
      setView('loading');
    } else if (isLoginSuccess) {
      onOpenChange(false);
    } else if (isLoginError) {
      setView('error');
      setErrorMsg('Authentication failed. Please try again.');
    }
  }, [isLoggingIn, isLoginSuccess, isLoginError, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setView('choice');
      setErrorMsg('');
    }
  }, [open]);

  const handleLogin = (intent: 'login' | 'signup') => {
    setAuthIntent(intent);
    setView('loading');
    login();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {view === 'choice' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-6 w-6 text-primary" />
                <DialogTitle className="text-xl font-bold">Welcome to UniXange</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Campus marketplace exclusively for Jain University students.
                <br />
                <span className="text-xs mt-1 block">
                  Requires a <strong>@jainuniversity.ac.in</strong> email address.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => handleLogin('login')}
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Login
              </button>
              <button
                onClick={() => handleLogin('signup')}
                disabled={isLoggingIn}
                className="w-full py-3 px-4 border-2 border-primary text-primary rounded-md font-semibold hover:bg-accent transition-colors disabled:opacity-50"
              >
                Sign Up
              </button>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Powered by Internet Identity — secure, private authentication.
              </p>
            </div>
          </>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-foreground font-medium">Authenticating...</p>
            <p className="text-sm text-muted-foreground">
              Please complete the login in the popup window.
            </p>
          </div>
        )}

        {view === 'access-denied' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <ShieldX className="h-12 w-12 text-destructive" />
            <DialogTitle className="text-xl font-bold text-destructive">Access Denied</DialogTitle>
            <p className="text-sm text-muted-foreground">
              UniXange is exclusively for{' '}
              <strong>@jainuniversity.ac.in</strong> students. Please use your
              Jain University email address.
            </p>
            <button
              onClick={() => setView('choice')}
              className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {view === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <ShieldX className="h-12 w-12 text-destructive" />
            <DialogTitle className="text-xl font-bold">Authentication Error</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {errorMsg || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => setView('choice')}
              className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
