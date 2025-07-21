import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const LoadingScreen = () => {
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
              <h2 className="text-xl font-bold text-primary">Loading AI Model</h2>
              <p className="text-muted-foreground">
                Initializing emotion detection engine...
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  This may take a moment on first load
                </span>
              </div>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-1 bg-gradient-sentiment rounded-full"
            />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};