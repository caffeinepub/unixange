import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { setAuthIntent, clearAuthIntent } from '@/utils/authIntent';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      setAuthIntent('login');
      await login();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Login error:', error);
      clearAuthIntent();
    }
  };

  const handleSignup = async () => {
    try {
      setAuthIntent('signup');
      await login();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Sign up error:', error);
      clearAuthIntent();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg border border-border/50 bg-card backdrop-blur-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-tight text-foreground">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-base font-light text-muted-foreground">
            Please choose an option to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <p className="text-sm font-light text-muted-foreground">
            You need to be authenticated to post items on UniXange. Choose Login if you already have an account, or Sign up to create a new profile.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              variant="outline"
              className="w-full rounded-full py-5 text-sm font-light transition-opacity-smooth hover:opacity-80"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>

            <Button
              onClick={handleSignup}
              disabled={isLoggingIn}
              className="w-full rounded-full py-5 text-sm font-light transition-opacity-smooth hover:opacity-80"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign up with Internet Identity
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs font-light text-muted-foreground">
            Both options use Internet Identity for secure authentication
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
