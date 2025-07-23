import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const LoadingScreen = ({ 
  onRetry, 
  currentModel 
}: { 
  onRetry?: () => void;
  currentModel?: string;
}) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTips, setShowTips] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('Initializing');

  // Track loading time and update loading phases
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
      
      // Show tips after 10 seconds
      if (loadingTime === 10) {
        setShowTips(true);
      }
      
      // Update loading phase based on time
      if (loadingTime === 1) {
        setLoadingPhase('Establishing API connection');
      } else if (loadingTime === 2) {
        setLoadingPhase('Configuring sentiment analysis');
      } else if (loadingTime === 3) {
        setLoadingPhase('Testing API connectivity');
      } else if (loadingTime === 4) {
        setLoadingPhase('Almost ready');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [loadingTime]);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/50 shadow-glow max-w-md w-full">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                <Brain className="w-full h-full text-primary" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-primary/20"
              />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-primary">Connecting to Sentiment API</h2>
              <p className="text-muted-foreground">
                {currentModel ? `Initializing ${currentModel}...` : 'Preparing cloud-based emotion detection...'}
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {loadingTime < 10 ? 
                    "This may take a moment on first load" : 
                    `${loadingPhase} (${loadingTime}s)...`
                  }
                </span>
              </div>
              
              {/* Connection status */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-destructive'}`}>
                  {isOnline ? 'Connected' : 'No internet connection'}
                </span>
              </div>
            </div>

            {/* Loading bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-1 bg-gradient-sentiment rounded-full"
            />
            
            {/* Tips for slow loading */}
            {showTips && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground mt-4 space-y-2"
              >
                <p className="font-medium">Taking longer than expected?</p>
                <ul className="text-left text-xs space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• The API service might be experiencing high traffic</li>
                  <li>• Consider using the Gemini API fallback</li>
                  <li>• Try refreshing the page</li>
                </ul>
                
                {onRetry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="mt-3"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Loading
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};