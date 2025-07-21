import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertCircle } from 'lucide-react';
import { SentimentForm } from '@/components/SentimentForm';
import { EmotionFeed } from '@/components/EmotionFeed';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useSentimentAnalysis, SentimentResult } from '@/hooks/useSentimentAnalysis';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Dashboard = () => {
  const [sentiments, setSentiments] = useState<SentimentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const { toast } = useToast();

  const {
    isLoading,
    isModelLoaded,
    error,
    loadModel,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion
  } = useSentimentAnalysis();

  useEffect(() => {
    // Auto-load model on component mount
    loadModel().catch((err) => {
      toast({
        variant: "destructive",
        title: "Model Loading Failed",
        description: "Failed to load the emotion detection model. Please check your connection."
      });
    });
  }, [loadModel, toast]);

  const handleAnalyze = async (message: string, customerId?: string, channel?: string): Promise<SentimentResult> => {
    try {
      const result = await analyzeSentiment(message, customerId, channel);
      setCurrentResult(result);
      setSentiments(prev => [...prev, result]);
      
      // Show toast notification for high-confidence negative emotions
      if (isNegativeEmotion(result.emotion) && result.confidence > 0.8) {
        toast({
          variant: "destructive",
          title: "High Negative Sentiment Detected",
          description: `${result.emotion.toUpperCase()} detected with ${(result.confidence * 100).toFixed(1)}% confidence`
        });
      } else if (result.confidence > 0.9) {
        toast({
          title: "High Confidence Analysis",
          description: `${result.emotion.toUpperCase()} detected with ${(result.confidence * 100).toFixed(1)}% confidence`
        });
      }
      
      return result;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Failed to analyze sentiment"
      });
      throw err;
    }
  };

  // Show loading screen while model is loading
  if (isLoading && !isModelLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-sentiment rounded-xl shadow-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Customer Sentiment Watchdog
              </h1>
              <p className="text-muted-foreground">
                AI-powered emotion detection for customer communications
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isModelLoaded ? 'bg-primary' : 'bg-muted'}`} />
              <span className={isModelLoaded ? 'text-primary' : 'text-muted-foreground'}>
                AI Model {isModelLoaded ? 'Ready' : 'Loading'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {sentiments.length} messages analyzed
              </span>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Alert className="bg-destructive/10 border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Analysis Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SentimentForm
              onAnalyze={handleAnalyze}
              isAnalyzing={isLoading}
              result={currentResult}
              getEmotionColor={getEmotionColor}
            />
          </motion.div>

          {/* Right Column - Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EmotionFeed
              sentiments={sentiments}
              getEmotionColor={getEmotionColor}
              isNegativeEmotion={isNegativeEmotion}
            />
          </motion.div>
        </div>

        {/* Technical Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Technical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Model:</span> Xenova/distilbert-base-uncased-finetuned-sst-2-english
                </div>
                <div>
                  <span className="font-medium">Analysis:</span> Binary sentiment (Positive/Negative)
                </div>
                <div>
                  <span className="font-medium">Processing:</span> Client-side AI with ONNX runtime
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};