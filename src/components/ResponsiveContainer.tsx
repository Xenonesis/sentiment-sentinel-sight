import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const ResponsiveContainer = ({ 
  children, 
  className, 
  mobileClassName, 
  desktopClassName 
}: ResponsiveContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      className,
      isMobile ? mobileClassName : desktopClassName
    )}>
      {children}
    </div>
  );
};