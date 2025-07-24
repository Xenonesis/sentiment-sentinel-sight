import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { analyzeWithGemini, isGeminiConfigured } from '@/services/geminiService';
import { analyzeWithOllama, isOllamaConfigured, isOllamaAvailable, getConfiguredOllamaModel } from '@/services/ollamaService';
import { useRetry } from './useRetry';
import { checkWebAssemblySupport, checkMemoryAvailability, getDiagnosticInfo } from '@/utils/browserSupport';
import { analyzeSentiment as apiAnalyzeSentiment } from '@/services/sentimentApiService';
import { getEnabledProvidersInOrder, isProviderEnabled, ApiProvider } from '@/services/apiPreferencesService';
import { networkManager } from '@/utils/networkManager';
import { ErrorClassifier } from '@/utils/errorClassifier';

export interface SentimentResult {
  emotion: string;
  confidence: number;
  timestamp: Date;
  message: string;
  customerId?: string;
  channel?: string;
}

export interface EmotionScore {
  label: string;
  score: number;
}

export const useSentimentAnalysis = () => {
  const [model, setModel] = useState<((text: string) => Promise<EmotionScore[]>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingGemini, setUsingGemini] = useState(false);
  const [usingOllama, setUsingOllama] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [currentModelName, setCurrentModelName] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    if (model) return model;
    
    setIsLoading(true);
    setError(null);
    
    // Check if Ollama is available
    const ollamaCheck = await isOllamaAvailable();
    setOllamaAvailable(ollamaCheck);
    
    try {
      // Initialize the real sentiment analysis API service
      logger.log('Initializing sentiment analysis API service...');
      setCurrentModelName('Sentiment Analysis API');
      
      // Create a function that wraps our API sentiment analyzer to match the expected interface
      const apiPipeline = async (text: string): Promise<EmotionScore[]> => {
        try {
          // Call the real sentiment analysis API
          const result = await apiAnalyzeSentiment(text);
          
          // Convert the API result to the expected format
          return [{
            label: result.emotion,
            score: result.confidence
          }];
        } catch (error) {
          logger.error('API sentiment analysis error:', error);
          throw error;
        }
      };
      
      // Test the API with a simple request
      try {
        await apiPipeline("This is a test message to verify the API works correctly.");
        logger.log('API test successful');
      } catch (testError) {
        logger.warn('API test failed, but continuing anyway:', testError);
        // We'll continue even if the test fails, as the API might work for real requests
      }
      
      setModel(apiPipeline);
      setIsModelLoaded(true);
      logger.log('Sentiment analysis API service initialized successfully!');
      return apiPipeline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize sentiment analysis API';
      setError(errorMessage);
      logger.error('Sentiment analysis initialization error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [model]);

  const analyzeSentiment = useCallback(async (
    message: string,
    customerId?: string,
    channel?: string
  ): Promise<SentimentResult> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get enabled providers in user's preferred order
      const enabledProviders = getEnabledProvidersInOrder();
      
      if (enabledProviders.length === 0) {
        throw new Error('No API providers are enabled. Please enable at least one provider in Settings.');
      }

      // Try each enabled provider in order
      for (const provider of enabledProviders) {
        try {
          logger.log(`Trying provider: ${provider}`);
          
          switch (provider) {
            case 'huggingface':
              if (!isProviderEnabled('huggingface')) continue;
              
              let currentModel = model;
              if (!currentModel) {
                currentModel = await loadModel();
              }
              
              setUsingGemini(false);
              setUsingOllama(false);
              setCurrentModelName('HuggingFace Sentiment Analysis');
              
              const results = await currentModel(message) as EmotionScore[];
              const topEmotion = results.reduce((prev, current) => 
                prev.score > current.score ? prev : current
              );

              return {
                emotion: topEmotion.label,
                confidence: topEmotion.score,
                timestamp: new Date(),
                message,
                customerId,
                channel
              };

            case 'ollama':
              if (!isProviderEnabled('ollama') || !isOllamaConfigured() || !ollamaAvailable) continue;
              
              setUsingOllama(true);
              setUsingGemini(false);
              const ollamaModel = getConfiguredOllamaModel() || 'llama2';
              setCurrentModelName(`Ollama (${ollamaModel})`);
              
              const ollamaResult = await analyzeWithOllama(message, ollamaModel);
              
              return {
                emotion: ollamaResult.emotion,
                confidence: ollamaResult.confidence,
                timestamp: new Date(),
                message,
                customerId,
                channel
              };

            case 'gemini':
              if (!isProviderEnabled('gemini') || !isGeminiConfigured()) continue;
              
              setUsingGemini(true);
              setUsingOllama(false);
              setCurrentModelName('Google Gemini 2.0 Flash');
              
              const geminiResult = await analyzeWithGemini(message);
              
              return {
                emotion: geminiResult.emotion,
                confidence: geminiResult.confidence,
                timestamp: new Date(),
                message,
                customerId,
                channel
              };

            case 'sentiment-api':
              if (!isProviderEnabled('sentiment-api')) continue;
              
              setUsingGemini(false);
              setUsingOllama(false);
              setCurrentModelName('Sentiment Analysis API');
              
              const apiResult = await apiAnalyzeSentiment(message);
              
              return {
                emotion: apiResult.emotion,
                confidence: apiResult.confidence,
                timestamp: new Date(),
                message,
                customerId,
                channel
              };

            default:
              logger.warn(`Unknown provider: ${provider}`);
              continue;
          }
        } catch (error) {
          logger.warn(`Provider ${provider} failed:`, error);
          // Continue to next provider
          continue;
        }
      }

      // If all providers failed
      const errorMessage = `All enabled providers failed. Please check your configuration in Settings.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [model, loadModel, ollamaAvailable]);

  const getEmotionColor = useCallback((emotion: string): string => {
    const emotionColors: Record<string, string> = {
      positive: 'sentiment-joy',
      negative: 'sentiment-anger',
      joy: 'sentiment-joy',
      optimism: 'sentiment-optimism',
      surprise: 'sentiment-surprise',
      love: 'sentiment-love',
      anger: 'sentiment-anger',
      fear: 'sentiment-fear',
      sadness: 'sentiment-sadness',
      disgust: 'sentiment-disgust',
      neutral: 'sentiment-neutral'
    };
    
    return emotionColors[emotion.toLowerCase()] || 'sentiment-neutral';
  }, []);

  const isNegativeEmotion = useCallback((emotion: string): boolean => {
    const negativeEmotions = ['negative', 'anger', 'fear', 'sadness', 'disgust'];
    return negativeEmotions.includes(emotion.toLowerCase());
  }, []);

  return {
    model,
    isLoading,
    isModelLoaded,
    error,
    usingGemini,
    usingOllama,
    ollamaAvailable,
    currentModelName,
    loadModel,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion,
    isGeminiConfigured: isGeminiConfigured(),
    isOllamaConfigured: isOllamaConfigured(),
    isOllamaAvailable: ollamaAvailable
  };
};