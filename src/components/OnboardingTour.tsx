/**
 * Onboarding Tour Component
 * Introduces new users to the application features
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Database,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserSettings } from '@/hooks/useUserSettings';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Sentiment Sentinel!',
    description: 'Your AI-powered customer sentiment analysis tool. Let\'s take a quick tour of the new features.',
    icon: <Sparkles className="h-6 w-6" />,
    highlight: true
  },
  {
    id: 'form-memory',
    title: 'Smart Form Memory',
    description: 'The app now remembers your last customer ID, channel, and message content. No more retyping!',
    icon: <MessageSquare className="h-6 w-6" />,
    target: '.sentiment-form'
  },
  {
    id: 'settings',
    title: 'Enhanced Settings',
    description: 'Customize your experience with new preferences for form data, interface, and analysis settings.',
    icon: <Settings className="h-6 w-6" />,
    target: '[data-testid="settings-button"]'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'View detailed insights and trends from your sentiment analysis history.',
    icon: <BarChart3 className="h-6 w-6" />,
    target: '.analytics-section'
  },
  {
    id: 'data-management',
    title: 'Data Management',
    description: 'Export your data, manage storage, and keep your analysis history organized.',
    icon: <Database className="h-6 w-6" />,
    target: '.data-management'
  }
];

export const OnboardingTour = () => {
  const { settings, updateUISettings } = useUserSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show onboarding if it's enabled and this is likely a first visit
    if (settings.ui.showOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [settings.ui.showOnboarding]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    updateUISettings({ showOnboarding: false });
    setIsVisible(false);
  };

  const handleComplete = () => {
    updateUISettings({ showOnboarding: false });
    setIsVisible(false);
  };

  const currentStepData = onboardingSteps[currentStep];

  if (!isVisible || !settings.ui.showOnboarding) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-card border-border/50 shadow-glow">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} of {onboardingSteps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <motion.div
                key={currentStepData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className={`p-3 rounded-full ${currentStepData.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {currentStepData.icon}
                </div>
                
                <CardTitle className="text-xl font-bold">
                  {currentStepData.title}
                </CardTitle>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.p
                key={currentStepData.description}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground leading-relaxed"
              >
                {currentStepData.description}
              </motion.p>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip Tour
                </Button>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center space-x-2 pt-2">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : index < currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};