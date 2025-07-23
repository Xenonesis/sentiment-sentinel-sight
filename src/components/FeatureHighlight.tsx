/**
 * Feature Highlight Component
 * Shows contextual highlights for new features
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';

interface FeatureHighlightProps {
  feature: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const FeatureHighlight = ({ 
  feature, 
  title, 
  description, 
  target, 
  position = 'bottom',
  delay = 0 
}: FeatureHighlightProps) => {
  const { settings, updateUISettings } = useUserSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if this feature highlight has been shown before
    const shownFeatures = JSON.parse(localStorage.getItem('shown_features') || '[]');
    
    if (!shownFeatures.includes(feature) && settings.ui.showTooltips && !hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [feature, settings.ui.showTooltips, delay, hasShown]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Mark this feature as shown
    const shownFeatures = JSON.parse(localStorage.getItem('shown_features') || '[]');
    if (!shownFeatures.includes(feature)) {
      shownFeatures.push(feature);
      localStorage.setItem('shown_features', JSON.stringify(shownFeatures));
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
        className={`absolute z-40 ${
          position === 'top' ? 'bottom-full mb-2' : 
          position === 'bottom' ? 'top-full mt-2' :
          position === 'left' ? 'right-full mr-2' :
          'left-full ml-2'
        }`}
      >
        <Card className="bg-primary text-primary-foreground border-primary/20 shadow-lg max-w-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <h4 className="font-semibold text-sm">{title}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/90 leading-relaxed">
              {description}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDismiss}
              className="mt-3 w-full h-7 text-xs"
            >
              Got it!
            </Button>
          </CardContent>
        </Card>
        
        {/* Arrow pointer */}
        <div className={`absolute ${
          position === 'top' ? 'top-0 left-1/2 transform -translate-x-1/2 translate-y-full' :
          position === 'bottom' ? 'bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-full' :
          position === 'left' ? 'left-0 top-1/2 transform translate-x-full -translate-y-1/2' :
          'right-0 top-1/2 transform -translate-x-full -translate-y-1/2'
        }`}>
          <div className={`w-0 h-0 ${
            position === 'top' ? 'border-l-4 border-r-4 border-t-4 border-transparent border-t-primary' :
            position === 'bottom' ? 'border-l-4 border-r-4 border-b-4 border-transparent border-b-primary' :
            position === 'left' ? 'border-t-4 border-b-4 border-l-4 border-transparent border-l-primary' :
            'border-t-4 border-b-4 border-r-4 border-transparent border-r-primary'
          }`} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};