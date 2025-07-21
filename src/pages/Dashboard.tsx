import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertCircle, Settings, Info, Download, Trash2, Database, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SettingsPage } from '@/components/SettingsPage';
import { SentimentForm } from '@/components/SentimentForm';
import { EmotionFeed } from '@/components/EmotionFeed';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ExportModal } from '@/components/ExportModal';
import { BulkAnalysisModal } from '@/components/BulkAnalysisModal';
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard';
import { useSentimentAnalysis, SentimentResult } from '@/hooks/useSentimentAnalysis';
import { usePersistedSentiments } from '@/hooks/usePersistedSentiments';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Dashboard = () => {
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use persisted sentiments instead of regular state
  const { sentiments, addSentiment, clearHistory, getStorageInfo } = usePersistedSentiments();

  const {
    isLoading,
    isModelLoaded,
    error,
    usingGemini,
    loadModel,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion,
    isGeminiConfigured
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
      addSentiment(result);
      
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

  const handleBulkComplete = (results: SentimentResult[]) => {
    // Add all results to the sentiment history
    results.forEach(result => addSentiment(result));
    
    // Set the last result as current for display
    if (results.length > 0) {
      setCurrentResult(results[results.length - 1]);
    }
    
    toast({
      title: "Bulk Analysis Complete",
      description: `Successfully processed ${results.length} messages. Check the emotion feed for all results.`,
    });
  };

  // Show loading screen while model is loading
  if (isLoading && !isModelLoaded && !isGeminiConfigured) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-sentiment rounded-xl shadow-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sentinel Sight
              </h1>
              <p className="text-muted-foreground">
                AI-powered emotion detection for customer communications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BulkAnalysisModal
              onAnalyze={handleAnalyze}
              onBulkComplete={handleBulkComplete}
              isAnalyzing={isLoading}
            />
            <Button
              variant="outline"
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              disabled={sentiments.length === 0}
              className={`flex items-center gap-2 ${showAdvancedAnalytics ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <BarChart3 className="h-4 w-4" />
              {showAdvancedAnalytics ? 'Back to Dashboard' : 'Analytics'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              disabled={sentiments.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Status Information */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-6 text-sm flex-wrap"
        >
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isModelLoaded ? 'bg-primary' : 'bg-muted'}`} />
            <span className={isModelLoaded ? 'text-primary' : 'text-muted-foreground'}>
              HuggingFace Model {isModelLoaded ? 'Ready' : 'Loading'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isGeminiConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className={isGeminiConfigured ? 'text-green-500' : 'text-yellow-500'}>
              Gemini {isGeminiConfigured ? 'Ready' : 'Not Configured'}
            </span>
          </div>
          {usingGemini && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-500">Using Gemini API</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {sentiments.length} messages analyzed
            </span>
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
              <AlertDescription>
                {error}
                {!isGeminiConfigured && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSettings(true)}
                      className="ml-2"
                    >
                      Configure Gemini API
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content */}
        {showAdvancedAnalytics ? (
          /* Advanced Analytics Dashboard */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AdvancedAnalyticsDashboard
              sentiments={sentiments}
              getEmotionColor={getEmotionColor}
              isNegativeEmotion={isNegativeEmotion}
            />
          </motion.div>
        ) : (
          /* Standard Dashboard Layout */
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
        )}

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
                  <span className="font-medium">Primary Model:</span>
                  <div className="text-xs mt-1">Xenova/distilbert-base-uncased-finetuned-sst-2-english</div>
                </div>
                <div>
                  <span className="font-medium">Fallback:</span>
                  <div className="text-xs mt-1">Google Gemini 2.0 Flash {isGeminiConfigured ? '(Ready)' : '(Not Configured)'}</div>
                </div>
                <div>
                  <span className="font-medium">Processing:</span>
                  <div className="text-xs mt-1">{usingGemini ? 'Cloud AI via Gemini' : 'Client-side ONNX'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
      
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          sentiments={sentiments}
          getEmotionColor={getEmotionColor}
        />
      )}
    </div>
  );
};