import { useState, useCallback } from 'react';
import { SentimentResult } from './useSentimentAnalysis';
import { logger } from '@/utils/logger';

export interface BulkAnalysisStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageConfidence: number;
  emotionDistribution: Record<string, number>;
  processingTime: number;
}

export const useBulkAnalysis = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<BulkAnalysisStats | null>(null);

  const calculateStats = useCallback((results: SentimentResult[], errors: number, startTime: number): BulkAnalysisStats => {
    const processingTime = Date.now() - startTime;
    const totalProcessed = results.length + errors;
    const successCount = results.length;
    const errorCount = errors;

    // Calculate average confidence
    const averageConfidence = results.length > 0 
      ? results.reduce((sum, result) => sum + result.confidence, 0) / results.length 
      : 0;

    // Calculate emotion distribution
    const emotionDistribution = results.reduce((acc, result) => {
      acc[result.emotion] = (acc[result.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProcessed,
      successCount,
      errorCount,
      averageConfidence,
      emotionDistribution,
      processingTime
    };
  }, []);

  const processBulk = useCallback(async (
    messages: Array<{ message: string; customerId?: string; channel?: string }>,
    analyzeFunction: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ results: SentimentResult[]; stats: BulkAnalysisStats }> => {
    setIsProcessing(true);
    setProgress(0);
    
    const startTime = Date.now();
    const results: SentimentResult[] = [];
    let errorCount = 0;

    for (let i = 0; i < messages.length; i++) {
      const { message, customerId, channel } = messages[i];
      
      try {
        const result = await analyzeFunction(message, customerId, channel);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to analyze message ${i + 1}:`, error);
        errorCount++;
      }

      const currentProgress = ((i + 1) / messages.length) * 100;
      setProgress(currentProgress);
      onProgress?.(i + 1, messages.length);

      // Small delay to prevent overwhelming the API
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const finalStats = calculateStats(results, errorCount, startTime);
    setStats(finalStats);
    setIsProcessing(false);

    return { results, stats: finalStats };
  }, [calculateStats]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setStats(null);
  }, []);

  return {
    isProcessing,
    progress,
    stats,
    processBulk,
    reset
  };
};