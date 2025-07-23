import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { analyzeWithGemini, isGeminiConfigured } from '@/services/geminiService';
import { useRetry } from './useRetry';

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

export const useLazySentimentAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingGemini, setUsingGemini] = useState(false);

  // Lazy load the transformers library only when needed
  const loadTransformersModel = useCallback(async () => {
    try {
      logger.log('Dynamically loading transformers library...');
      const { pipeline } = await import('@huggingface/transformers');
      
      logger.log('Loading emotion classification model...');
      const emotionPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      logger.log('Model loaded successfully!');
      return emotionPipeline;
    } catch (err) {
      logger.error('Model loading error:', err);
      throw err;
    }
  }, []);

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
      // First try Gemini if configured (faster and lighter)
      if (isGeminiConfigured()) {
        try {
          setUsingGemini(true);
          const geminiResult = await analyzeWithGemini(message);
          
          return {
            emotion: geminiResult.emotion,
            confidence: geminiResult.confidence,
            timestamp: new Date(),
            message,
            customerId,
            channel
          };
        } catch (geminiError) {
          logger.warn('Gemini analysis failed, falling back to local model...', geminiError);
        }
      }

      // Fallback to HuggingFace model (lazy loaded)
      setUsingGemini(false);
      const model = await loadTransformersModel();
      const results = await model(message) as EmotionScore[];
      
      // Get the emotion with highest confidence
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
    } catch (err) {
      const errorMessage = `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadTransformersModel]);

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
    isLoading,
    error,
    usingGemini,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion,
    isGeminiConfigured: isGeminiConfigured()
  };
};