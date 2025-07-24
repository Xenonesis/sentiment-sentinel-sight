import { useLocation } from 'react-router-dom';
import { NavItem } from './NavItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavItemType } from './types';

interface DesktopNavProps {
  navItems: NavItemType[];
}

export const DesktopNav = ({ navItems }: DesktopNavProps) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          isActive={location.pathname === item.path}
          variant="desktop"
        />
      ))}
      <ThemeToggle />
    </div>
  );
};