import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, ShieldAlert, RefreshCw } from 'lucide-react';

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
  const isStoppedCanister =
    (variant === 'error' || variant === 'timeout') &&
    !!errorMessage &&
    (errorMessage.includes('is stopped') ||
      errorMessage.includes('IC0508') ||
      errorMessage.includes('unavailable'));

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
    if (isStoppedCanister) return 'Service Temporarily Unavailable';
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
    if (isStoppedCanister) {
      return 'The backend service is restarting. This usually resolves in a few seconds — please click Retry to reconnect.';
    }
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
            <Button onClick={onRetry} variant="default" className="w-full sm:w-auto gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
          <Button onClick={onLogout} variant="outline" className="w-full sm:w-auto">
            Logout
          </Button>
        </div>

        {errorMessage && (isStoppedCanister || (variant === 'error' && errorMessage.includes('canister'))) && (
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
