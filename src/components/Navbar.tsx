import { useState } from 'react';
import { Info, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from './navbar/Logo';
import { DesktopNav } from './navbar/DesktopNav';
import { MobileNav } from './navbar/MobileNav';
import { MobileMenuButton } from './navbar/MobileMenuButton';
import type { NavItemType } from './navbar/types';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItemType[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Logo />
          <DesktopNav navItems={navItems} />
          
          <div className="md:hidden flex items-center space-x-1">
            <ThemeToggle />
            <MobileMenuButton isMenuOpen={isMenuOpen} onToggle={toggleMenu} />
          </div>
        </div>

        <MobileNav 
          isMenuOpen={isMenuOpen} 
          navItems={navItems} 
          onItemClick={() => setIsMenuOpen(false)} 
        />
      </div>
    </nav>
  );
};