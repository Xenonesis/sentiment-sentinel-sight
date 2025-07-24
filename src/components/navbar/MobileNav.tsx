import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem } from './NavItem';
import { NavItemType } from './types';

interface MobileNavProps {
  isMenuOpen: boolean;
  navItems: NavItemType[];
  onItemClick: () => void;
}

export const MobileNav = ({ isMenuOpen, navItems, onItemClick }: MobileNavProps) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                {...item}
                isActive={location.pathname === item.path}
                variant="mobile"
                onClick={onItemClick}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};