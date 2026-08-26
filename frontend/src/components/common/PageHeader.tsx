import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

/**
 * Standard, beginner-friendly page header with optional subtitle, badge, and action slot
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badgeText,
  children,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold font-serif text-foreground">{title}</h1>
          {badgeText && (
            <Badge variant="outline" className="border-brand-saffron/40 text-brand-saffron bg-brand-saffron/10 font-medium">
              {badgeText}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};
