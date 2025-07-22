import { useState, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';
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

export const useSentimentAnalysis = () => {
  const [model, setModel] = useState<((text: string) => Promise<EmotionScore[]>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingGemini, setUsingGemini] = useState(false);

  const loadModel = useCallback(async () => {
    if (model) return model;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading emotion classification model...');
      // Try a model that definitely has ONNX support
      const emotionPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      setModel(emotionPipeline);
      setIsModelLoaded(true);
      console.log('Model loaded successfully!');
      return emotionPipeline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
      setError(errorMessage);
      console.error('Model loading error:', err);
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
      // First try HuggingFace model
      let currentModel = model;
      if (!currentModel) {
        try {
          currentModel = await loadModel();
        } catch (modelError) {
          console.warn('HuggingFace model failed to load, trying Gemini fallback...', modelError);
          
          // Fallback to Gemini if available
          if (isGeminiConfigured()) {
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
          } else {
            throw new Error('HuggingFace model unavailable and Gemini not configured. Please add your Gemini API key in Settings.');
          }
        }
      }

      // Use HuggingFace model
      setUsingGemini(false);
      const results = await currentModel(message) as EmotionScore[];
      
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
      console.error('Primary analysis failed, trying Gemini fallback...', err);
      
      // Final fallback to Gemini
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
          const errorMessage = `Both analysis methods failed. HuggingFace: ${err instanceof Error ? err.message : 'Unknown error'}. Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`;
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        const errorMessage = `Analysis failed and no fallback available. Please configure Gemini API key in Settings. Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [model, loadModel]);

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
    loadModel,
    analyzeSentiment,
    getEmotionColor,
    isNegativeEmotion,
    isGeminiConfigured: isGeminiConfigured()
  };
};