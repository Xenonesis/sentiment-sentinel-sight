import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  variant?: 'desktop' | 'mobile';
  onClick?: () => void;
}

export const NavItem = ({ 
  path, 
  label, 
  icon: Icon, 
  isActive, 
  variant = 'desktop',
  onClick 
}: NavItemProps) => {
  const baseClasses = "flex items-center rounded-md font-medium transition-colors";
  const activeClasses = isActive 
    ? 'bg-primary/10 text-primary'
    : 'text-muted-foreground hover:text-foreground hover:bg-accent';

  if (variant === 'mobile') {
    return (
      <Link
        to={path}
        onClick={onClick}
        className={`${baseClasses} space-x-2 px-3 py-2 text-base ${activeClasses}`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={path}
      className={`${baseClasses} space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-sm ${activeClasses}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
};