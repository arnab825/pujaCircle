import React, { useState } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  variant?: 'card' | 'inline' | 'compact';
  severity?: 'destructive' | 'warning' | 'neutral';
  className?: string;
}

/**
 * ErrorState
 * Modern, reassuring error state component with support for retry loading states,
 * multiple display variants, and secondary navigation actions.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue while processing your request. Please try again.',
  onRetry,
  secondaryAction,
  variant = 'card',
  severity = 'destructive',
  className,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  // Severity style mappings
  const colorMap = {
    destructive: {
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      iconBg: 'bg-destructive/10',
      iconText: 'text-destructive',
      badge: 'text-destructive',
    },
    warning: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-600 dark:text-amber-400',
      badge: 'text-amber-600',
    },
    neutral: {
      bg: 'bg-muted/40',
      border: 'border-border',
      iconBg: 'bg-muted',
      iconText: 'text-muted-foreground',
      badge: 'text-muted-foreground',
    },
  }[severity];

  // Compact Variant (e.g. for small sidebar widgets or dropdowns)
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3.5 rounded-md border text-xs',
          colorMap.bg,
          colorMap.border,
          className
        )}
      >
        <div className={cn('p-1.5 rounded-md shrink-0', colorMap.iconBg, colorMap.iconText)}>
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{title}</p>
          {message && <p className="text-[11px] text-muted-foreground truncate">{message}</p>}
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-7 px-2 text-xs gap-1 shrink-0"
          >
            <RefreshCw className={cn('h-3 w-3', isRetrying && 'animate-spin')} />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Inline Variant (e.g. for banners above lists or forms)
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border text-xs',
          colorMap.bg,
          colorMap.border,
          className
        )}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={cn('p-2 rounded-md shrink-0 mt-0.5 sm:mt-0', colorMap.iconBg, colorMap.iconText)}>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {secondaryAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={secondaryAction.onClick}
              className="h-8 text-xs gap-1.5"
            >
              {secondaryAction.icon || <HelpCircle className="h-3.5 w-3.5" />}
              {secondaryAction.label}
            </Button>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-8 text-xs gap-1.5 shadow-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default 'card' Variant (Full structured standalone state)
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-lg border shadow-xs transition-all',
        colorMap.bg,
        colorMap.border,
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-md mb-4 shadow-xs',
          colorMap.iconBg,
          colorMap.iconText
        )}
      >
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold font-serif text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {secondaryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={secondaryAction.onClick}
            className="text-xs h-9 px-4 gap-1.5"
          >
            {secondaryAction.icon || <ArrowLeft className="h-3.5 w-3.5" />}
            {secondaryAction.label}
          </Button>
        )}
        {onRetry && (
          <Button
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-xs h-9 px-5 gap-1.5 shadow-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
