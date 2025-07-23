import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const MobileOptimizedCard = ({
  title,
  icon,
  children,
  className,
  contentClassName
}: MobileOptimizedCardProps) => {
  return (
    <Card className={cn("bg-gradient-card border-border/50 shadow-card", className)}>
      {title && (
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-primary">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-3 sm:p-6", title && "pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};