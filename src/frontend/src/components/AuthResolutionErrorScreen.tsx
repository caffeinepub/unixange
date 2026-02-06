import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';

interface AuthResolutionErrorScreenProps {
  variant: 'timeout' | 'access-denied' | 'error';
  errorMessage?: string;
  email?: string;
  onRetry?: () => void;
  onLogout: () => void;
}

export default function AuthResolutionErrorScreen({
  variant,
  errorMessage,
  email,
  onRetry,
  onLogout,
}: AuthResolutionErrorScreenProps) {
  const getIcon = () => {
    switch (variant) {
      case 'timeout':
        return <Clock className="h-16 w-16 text-warning" />;
      case 'access-denied':
        return <ShieldAlert className="h-16 w-16 text-destructive" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (variant) {
      case 'timeout':
        return 'Connection Timeout';
      case 'access-denied':
        return 'Access Denied';
      case 'error':
        return 'Something Went Wrong';
    }
  };

  const getMessage = () => {
    switch (variant) {
      case 'timeout':
        return 'The connection timed out while loading your profile. Please check your network connection and try again.';
      case 'access-denied':
        return email
          ? `Your email (${email}) is not authorized to access this platform. Please use a valid @jainuniversity.ac.in email address or contact support if you believe this is an error.`
          : 'Your email is not authorized to access this platform. Please use a valid @jainuniversity.ac.in email address.';
      case 'error':
        return errorMessage || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">{getIcon()}</div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{getTitle()}</h2>
          <p className="text-base text-foreground/70 whitespace-pre-wrap break-words">
            {getMessage()}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry && variant !== 'access-denied' && (
            <Button onClick={onRetry} variant="default" className="w-full sm:w-auto">
              Retry
            </Button>
          )}
          <Button onClick={onLogout} variant="outline" className="w-full sm:w-auto">
            Logout
          </Button>
        </div>

        {variant === 'error' && errorMessage && errorMessage.includes('canister') && (
          <div className="mt-4 rounded-lg border border-muted bg-muted/50 p-4 text-left">
            <p className="text-sm text-muted-foreground">
              <strong>Technical Details:</strong>
              <br />
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
