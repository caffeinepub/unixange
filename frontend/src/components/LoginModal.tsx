import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { setAuthIntent } from '../utils/authIntent';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginStatus } = useInternetIdentity();
  const [activeAction, setActiveAction] = useState<'login' | 'signup' | null>(null);

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    setActiveAction('login');
    setAuthIntent('login');
    try {
      await login();
      onClose();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleSignup = async () => {
    setActiveAction('signup');
    setAuthIntent('signup');
    try {
      await login();
      onClose();
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Welcome to UniXange</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Join the Jain University campus marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoggingIn && activeAction === 'login' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            {isLoggingIn && activeAction === 'login' ? 'Logging in...' : 'Login'}
          </button>

          <button
            onClick={handleSignup}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-semibold hover:bg-accent transition-colors disabled:opacity-50"
          >
            {isLoggingIn && activeAction === 'signup' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {isLoggingIn && activeAction === 'signup' ? 'Creating account...' : 'Sign up'}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
