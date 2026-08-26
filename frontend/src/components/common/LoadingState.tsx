import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Standard loading spinner card for tables, cards, and page sections
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading sacred details...',
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-saffron mb-3" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
};
