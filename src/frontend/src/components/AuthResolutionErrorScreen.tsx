import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, XCircle } from 'lucide-react';

interface AuthResolutionErrorScreenProps {
  variant: 'timeout' | 'access-denied' | 'error';
  email?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onLogout: () => void;
}

export default function AuthResolutionErrorScreen({
  variant,
  email,
  errorMessage,
  onRetry,
  onLogout,
}: AuthResolutionErrorScreenProps) {
  const renderContent = () => {
    switch (variant) {
      case 'timeout':
        return (
          <>
            <Clock className="mx-auto h-16 w-16 text-warning" />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Connection Timeout</h2>
            <p className="mt-4 text-base text-foreground/80">
              We couldn't load your profile within the expected time. This might be due to a slow network connection.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check your internet connection and try again.
            </p>
            <div className="mt-6 flex gap-3">
              {onRetry && (
                <Button onClick={onRetry} className="flex-1">
                  Retry
                </Button>
              )}
              <Button onClick={onLogout} variant="outline" className="flex-1">
                Logout
              </Button>
            </div>
          </>
        );

      case 'access-denied':
        return (
          <>
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-4 text-base text-foreground/80">
              {email ? (
                <>
                  Your email <span className="font-semibold">{email}</span> is not authorized to access UniXange.
                </>
              ) : (
                'Your email is not authorized to access UniXange.'
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Only <span className="font-semibold">@jainuniversity.ac.in</span> email addresses and approved admin emails are allowed.
            </p>
            <Button onClick={onLogout} variant="outline" className="mt-6 w-full">
              Logout
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Something Went Wrong</h2>
            <p className="mt-4 text-base text-foreground/80">
              {errorMessage || 'An unexpected error occurred while loading your profile.'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again or contact support if the problem persists.
            </p>
            <div className="mt-6 flex gap-3">
              {onRetry && (
                <Button onClick={onRetry} className="flex-1">
                  Retry
                </Button>
              )}
              <Button onClick={onLogout} variant="outline" className="flex-1">
                Logout
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="max-w-md rounded-lg border-2 border-border bg-card p-8 text-center shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
}
