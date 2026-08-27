import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

// Simple loading indicator for sections and cards
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-xs text-muted-foreground font-medium">{message}</p>
    </div>
  );
};
