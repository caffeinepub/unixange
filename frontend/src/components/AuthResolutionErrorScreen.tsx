import React from 'react';
import { AlertTriangle, Clock, ShieldOff, RefreshCw, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

type ErrorVariant = 'timeout' | 'access-denied' | 'error';

interface AuthResolutionErrorScreenProps {
  variant: ErrorVariant;
  message?: string;
  onRetry?: () => void;
}

export default function AuthResolutionErrorScreen({
  variant,
  message,
  onRetry,
}: AuthResolutionErrorScreenProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const config = {
    timeout: {
      icon: Clock,
      iconClass: 'text-warning',
      bgClass: 'bg-warning/10 border-warning/20',
      title: 'Connection Timeout',
      defaultMessage: 'The connection to the network timed out. Please check your internet connection and try again.',
    },
    'access-denied': {
      icon: ShieldOff,
      iconClass: 'text-destructive',
      bgClass: 'bg-destructive/10 border-destructive/20',
      title: 'Access Denied',
      defaultMessage: 'You do not have permission to access this resource.',
    },
    error: {
      icon: AlertTriangle,
      iconClass: 'text-destructive',
      bgClass: 'bg-destructive/10 border-destructive/20',
      title: 'Something Went Wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
    },
  };

  const { icon: Icon, iconClass, bgClass, title, defaultMessage } = config[variant];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-marketplace text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border ${bgClass} mb-4`}>
          <Icon className={`h-8 w-8 ${iconClass}`} />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {message || defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-full font-medium text-sm hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
