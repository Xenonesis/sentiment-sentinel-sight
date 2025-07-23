import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertCircle, Settings, Info, Download, Trash2, Database, BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SettingsPage } from '@/components/SettingsPage';
import { SentimentForm } from '@/components/SentimentForm';
import { EmotionFeed } from '@/components/EmotionFeed';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ExportModal } from '@/components/ExportModal';
import { BulkAnalysisModal } from '@/components/BulkAnalysisModal';
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSentimentAnalysis, SentimentResult } from '@/hooks/useSentimentAnalysis';
import { usePersistedSentiments } from '@/hooks/usePersistedSentiments';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { checkWebAssemblySupport } from '@/utils/browserSupport';

export const Dashboard = () => {
  const [currentResult, setCurrentResult] = useState<SentimentResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [browserCompatible, setBrowserCompatible] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use persisted sentiments instead of regular state
  const { sentiments, addSentiment, clearHistory, getStorageInfo } = usePersistedSentiments();

  const {
    isLoading,
    isModelLoaded,
    error,
    usingGemini,
    currentModelName,
    loadModel,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion,
    isGeminiConfigured
  } = useSentimentAnalysis();

  // We don't need to check browser compatibility anymore since we're using a local engine
  useEffect(() => {
    setBrowserCompatible(true);
  }, []);

  useEffect(() => {
    // Only try to load the model if the browser is compatible or we haven't checked yet
    if (browserCompatible === false) {
      return; // Skip model loading if browser is incompatible
    }
    
    // Auto-load model on component mount with retry logic
    const loadModelWithRetry = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          await loadModel();
          return; // Success, exit the retry loop
        } catch (err) {
          attempts++;
          logger.warn(`Model loading attempt ${attempts}/${maxAttempts} failed:`, err);
          
          if (attempts >= maxAttempts) {
            // All attempts failed
            toast({
              variant: "destructive",
              title: "Model Loading Failed",
              description: "Failed to load the emotion detection model. Please check your connection or try using Gemini API as a fallback."
            });
            
            // If Gemini is not configured, suggest configuring it
            if (!isGeminiConfigured) {
              toast({
                variant: "default",
                title: "Configure Fallback",
                description: "Consider adding a Gemini API key in Settings to enable cloud-based analysis."
              });
            }
          } else {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempts - 1)));
          }
        }
      }
    };
    
    loadModelWithRetry();
  }, [loadModel, toast, isGeminiConfigured, browserCompatible]);

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
    return (
      <LoadingScreen 
        onRetry={() => loadModel().catch(err => logger.error('Retry failed:', err))}
        currentModel={currentModelName || undefined}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Title Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-sentiment rounded-xl shadow-glow flex-shrink-0">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sentinel Sight
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                AI-powered emotion detection for customer communications
              </p>
            </div>
          </div>

          {/* Action Buttons - Mobile Responsive */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <BulkAnalysisModal
              onAnalyze={handleAnalyze}
              onBulkComplete={handleBulkComplete}
              isAnalyzing={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              disabled={sentiments.length === 0}
              className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${showAdvancedAnalytics ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{showAdvancedAnalytics ? 'Back to Dashboard' : 'Analytics'}</span>
              <span className="sm:hidden">Charts</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              disabled={sentiments.length === 0}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </motion.div>

        {/* Status Information - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap"
        >
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isModelLoaded ? 'bg-primary' : 'bg-muted'}`} />
            <span className={isModelLoaded ? 'text-primary' : 'text-muted-foreground'}>
              Sentiment Analysis API {isModelLoaded ? 'Ready' : 'Loading'}
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
        
        {/* We've removed the browser compatibility warning since we're using a local engine */}

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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Analysis Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="order-1"
            >
              <SentimentForm
                onAnalyze={handleAnalyze}
                isAnalyzing={isLoading}
                result={currentResult}
                getEmotionColor={getEmotionColor}
              />
            </motion.div>

            {/* Live Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="order-2"
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
            <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2 p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <span className="font-medium">Sentiment Analysis:</span>
                  <div className="text-xs mt-1">
                    {currentModelName ? (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span className="font-medium">{currentModelName}</span>
                        <span className="text-green-500 ml-1">(Active)</span>
                      </div>
                    ) : (
                      <span className="text-yellow-500">No API connected</span>
                    )}
                    <div className="text-muted mt-1">API Features:</div>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>Advanced NLP processing</li>
                      <li>Multi-language support</li>
                      <li>Context-aware analysis</li>
                      <li>Automatic fallback mechanisms</li>
                      <li>9 distinct emotion categories</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Fallback:</span>
                  <div className="text-xs mt-1">Google Gemini 2.0 Flash {isGeminiConfigured ? '(Ready)' : '(Not Configured)'}</div>
                </div>
                <div>
                  <span className="font-medium">Processing:</span>
                  <div className="text-xs mt-1">{usingGemini ? 'Cloud AI via Gemini' : 'Cloud API via MeaningCloud'}</div>
                  <div className="text-xs mt-1 text-muted">
                    Professional-grade sentiment analysis with advanced NLP capabilities
                  </div>
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
    </ErrorBoundary>
  );
};