/**
 * Enhanced Bulk Analysis Hook with Circuit Breaker and Smart Error Handling
 */
import { useState, useCallback, useRef } from 'react';
import { SentimentResult } from './useSentimentAnalysis';
import { logger } from '@/utils/logger';
import { networkManager } from '@/utils/networkManager';
import { ErrorClassifier, ClassifiedError, RecoveryStrategy } from '@/utils/errorClassifier';
import { ApiProvider, getEnabledProvidersInOrder } from '@/services/apiPreferencesService';

export interface BulkAnalysisStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageConfidence: number;
  emotionDistribution: Record<string, number>;
  processingTime: number;
  providerStats: Record<ApiProvider, {
    attempts: number;
    successes: number;
    failures: number;
    averageResponseTime: number;
  }>;
  errorSummary: Record<string, number>;
}

export interface BulkAnalysisOptions {
  batchSize?: number;
  maxConcurrent?: number;
  adaptiveBatching?: boolean;
  pauseOnHighErrorRate?: boolean;
  errorRateThreshold?: number;
  switchProviderThreshold?: number;
}

export interface BulkAnalysisState {
  isProcessing: boolean;
  isPaused: boolean;
  progress: number;
  currentProvider: ApiProvider | null;
  stats: BulkAnalysisStats | null;
  errors: ClassifiedError[];
  canResume: boolean;
  estimatedTimeRemaining: number;
}

export const useEnhancedBulkAnalysis = () => {
  const [state, setState] = useState<BulkAnalysisState>({
    isProcessing: false,
    isPaused: false,
    progress: 0,
    currentProvider: null,
    stats: null,
    errors: [],
    canResume: false,
    estimatedTimeRemaining: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseResolverRef = useRef<(() => void) | null>(null);
  const processingStateRef = useRef<{
    startTime: number;
    processedCount: number;
    totalCount: number;
    currentBatchSize: number;
    providerStats: Record<ApiProvider, any>;
    recentResponseTimes: number[];
  } | null>(null);

  const updateState = useCallback((updates: Partial<BulkAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateStats = useCallback((
    results: SentimentResult[], 
    errors: ClassifiedError[], 
    startTime: number,
    providerStats: Record<ApiProvider, any>
  ): BulkAnalysisStats => {
    const processingTime = Date.now() - startTime;
    const totalProcessed = results.length + errors.length;
    const successCount = results.length;
    const errorCount = errors.length;

    // Calculate average confidence
    const averageConfidence = results.length > 0 
      ? results.reduce((sum, result) => sum + result.confidence, 0) / results.length 
      : 0;

    // Calculate emotion distribution
    const emotionDistribution = results.reduce((acc, result) => {
      acc[result.emotion] = (acc[result.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate error summary
    const errorSummary = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProcessed,
      successCount,
      errorCount,
      averageConfidence,
      emotionDistribution,
      processingTime,
      providerStats,
      errorSummary
    };
  }, []);

  const estimateTimeRemaining = useCallback((
    processed: number, 
    total: number, 
    startTime: number
  ): number => {
    if (processed === 0) return 0;
    const elapsed = Date.now() - startTime;
    const rate = processed / elapsed;
    const remaining = total - processed;
    return remaining / rate;
  }, []);

  const adaptBatchSize = useCallback((
    currentBatchSize: number, 
    errorRate: number, 
    averageResponseTime: number
  ): number => {
    // Reduce batch size if error rate is high
    if (errorRate > 0.3) {
      return Math.max(1, Math.floor(currentBatchSize * 0.5));
    }
    
    // Increase batch size if performance is good
    if (errorRate < 0.1 && averageResponseTime < 2000) {
      return Math.min(10, currentBatchSize + 1);
    }
    
    return currentBatchSize;
  }, []);

  const selectBestProvider = useCallback((enabledProviders: ApiProvider[]): ApiProvider | null => {
    // Use network manager to get the best available provider
    const bestProvider = networkManager.getBestProvider(enabledProviders);
    
    if (!bestProvider) {
      // If no healthy providers, try offline-capable ones
      const offlineProviders = networkManager.getOfflineCapableProviders()
        .filter(p => enabledProviders.includes(p));
      return offlineProviders[0] || null;
    }
    
    return bestProvider;
  }, []);

  const shouldSwitchProvider = useCallback((
    currentProvider: ApiProvider, 
    recentErrors: ClassifiedError[], 
    threshold: number
  ): boolean => {
    const recentErrorsForProvider = recentErrors
      .filter(e => e.provider === currentProvider)
      .slice(-5); // Look at last 5 errors
    
    return recentErrorsForProvider.length >= threshold;
  }, []);

  const processBatch = useCallback(async (
    batch: Array<{ message: string; customerId?: string; channel?: string }>,
    analyzeFunction: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>,
    provider: ApiProvider
  ): Promise<{ results: SentimentResult[]; errors: ClassifiedError[]; responseTime: number }> => {
    const batchStartTime = Date.now();
    const results: SentimentResult[] = [];
    const errors: ClassifiedError[] = [];

    for (const item of batch) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Operation aborted');
      }

      // Check for pause
      if (pauseResolverRef.current) {
        await new Promise<void>(resolve => {
          pauseResolverRef.current = resolve;
        });
      }

      try {
        const itemStartTime = Date.now();
        const result = await analyzeFunction(item.message, item.customerId, item.channel);
        const responseTime = Date.now() - itemStartTime;
        
        results.push(result);
        networkManager.recordSuccess(provider, responseTime);
        
      } catch (error) {
        const classifiedError = ErrorClassifier.classify(error as Error, provider);
        errors.push(classifiedError);
        networkManager.recordFailure(provider, error as Error);
        
        logger.error(`Bulk analysis error for provider ${provider}:`, error);
      }
    }

    const totalResponseTime = Date.now() - batchStartTime;
    return { results, errors, responseTime: totalResponseTime };
  }, []);

  const processBulk = useCallback(async (
    messages: Array<{ message: string; customerId?: string; channel?: string }>,
    analyzeFunction: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>,
    options: BulkAnalysisOptions = {},
    onProgress?: (current: number, total: number, provider: ApiProvider) => void
  ): Promise<{ results: SentimentResult[]; stats: BulkAnalysisStats }> => {
    const {
      batchSize = 3,
      maxConcurrent = 2,
      adaptiveBatching = true,
      pauseOnHighErrorRate = true,
      errorRateThreshold = 0.5,
      switchProviderThreshold = 3
    } = options;

    // Initialize processing state
    const startTime = Date.now();
    abortControllerRef.current = new AbortController();
    
    processingStateRef.current = {
      startTime,
      processedCount: 0,
      totalCount: messages.length,
      currentBatchSize: batchSize,
      providerStats: {},
      recentResponseTimes: []
    };

    updateState({
      isProcessing: true,
      isPaused: false,
      progress: 0,
      errors: [],
      canResume: true,
      estimatedTimeRemaining: 0
    });

    const allResults: SentimentResult[] = [];
    const allErrors: ClassifiedError[] = [];
    const enabledProviders = getEnabledProvidersInOrder();
    let currentProvider = selectBestProvider(enabledProviders);
    
    if (!currentProvider) {
      throw new Error('No healthy providers available for bulk analysis');
    }

    updateState({ currentProvider });

    try {
      let messageIndex = 0;
      let currentBatchSize = batchSize;

      while (messageIndex < messages.length) {
        // Check if we should switch providers
        if (shouldSwitchProvider(currentProvider, allErrors, switchProviderThreshold)) {
          const remainingProviders = enabledProviders.filter(p => p !== currentProvider);
          const newProvider = selectBestProvider(remainingProviders);
          
          if (newProvider) {
            logger.log(`Switching from ${currentProvider} to ${newProvider} due to errors`);
            currentProvider = newProvider;
            updateState({ currentProvider });
          }
        }

        // Check if provider is still healthy
        if (!networkManager.isProviderHealthy(currentProvider)) {
          const newProvider = selectBestProvider(enabledProviders.filter(p => p !== currentProvider));
          if (newProvider) {
            currentProvider = newProvider;
            updateState({ currentProvider });
          } else {
            throw new Error('All providers are unhealthy');
          }
        }

        // Create batch
        const batch = messages.slice(messageIndex, messageIndex + currentBatchSize);
        
        try {
          const { results, errors, responseTime } = await processBatch(batch, analyzeFunction, currentProvider);
          
          allResults.push(...results);
          allErrors.push(...errors);
          
          // Update processing state
          if (processingStateRef.current) {
            processingStateRef.current.processedCount += batch.length;
            processingStateRef.current.recentResponseTimes.push(responseTime);
            
            // Keep only recent response times
            if (processingStateRef.current.recentResponseTimes.length > 10) {
              processingStateRef.current.recentResponseTimes = 
                processingStateRef.current.recentResponseTimes.slice(-10);
            }
          }

          messageIndex += batch.length;
          const progress = (messageIndex / messages.length) * 100;
          const timeRemaining = estimateTimeRemaining(messageIndex, messages.length, startTime);
          
          updateState({ 
            progress, 
            estimatedTimeRemaining: timeRemaining,
            errors: allErrors 
          });
          
          onProgress?.(messageIndex, messages.length, currentProvider);

          // Adaptive batching
          if (adaptiveBatching && processingStateRef.current) {
            const errorRate = errors.length / batch.length;
            const avgResponseTime = processingStateRef.current.recentResponseTimes.reduce((a, b) => a + b, 0) / 
                                   processingStateRef.current.recentResponseTimes.length;
            
            currentBatchSize = adaptBatchSize(currentBatchSize, errorRate, avgResponseTime);
            processingStateRef.current.currentBatchSize = currentBatchSize;
          }

          // Pause on high error rate
          if (pauseOnHighErrorRate && errors.length / batch.length > errorRateThreshold) {
            logger.warn(`High error rate detected (${errors.length}/${batch.length}), pausing for 5 seconds`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

        } catch (batchError) {
          logger.error('Batch processing failed:', batchError);
          
          // If entire batch fails, record errors for all items
          batch.forEach(item => {
            const classifiedError = ErrorClassifier.classify(batchError as Error, currentProvider);
            allErrors.push(classifiedError);
            networkManager.recordFailure(currentProvider, batchError as Error);
          });
          
          messageIndex += batch.length;
        }

        // Small delay between batches to prevent overwhelming
        if (messageIndex < messages.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate final stats
      const finalStats = calculateStats(
        allResults, 
        allErrors, 
        startTime, 
        processingStateRef.current?.providerStats || {}
      );

      updateState({ 
        isProcessing: false, 
        stats: finalStats,
        progress: 100,
        estimatedTimeRemaining: 0
      });

      return { results: allResults, stats: finalStats };

    } catch (error) {
      logger.error('Bulk analysis failed:', error);
      updateState({ isProcessing: false });
      throw error;
    }
  }, [calculateStats, estimateTimeRemaining, adaptBatchSize, selectBestProvider, shouldSwitchProvider, processBatch, updateState]);

  const pause = useCallback(() => {
    if (state.isProcessing && !state.isPaused) {
      updateState({ isPaused: true });
      logger.log('Bulk analysis paused');
    }
  }, [state.isProcessing, state.isPaused, updateState]);

  const resume = useCallback(() => {
    if (state.isProcessing && state.isPaused && pauseResolverRef.current) {
      pauseResolverRef.current();
      pauseResolverRef.current = null;
      updateState({ isPaused: false });
      logger.log('Bulk analysis resumed');
    }
  }, [state.isProcessing, state.isPaused, updateState]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (pauseResolverRef.current) {
      pauseResolverRef.current();
      pauseResolverRef.current = null;
    }
    
    updateState({ 
      isProcessing: false, 
      isPaused: false, 
      canResume: false 
    });
    
    logger.log('Bulk analysis aborted');
  }, [updateState]);

  const reset = useCallback(() => {
    abort();
    updateState({
      progress: 0,
      currentProvider: null,
      stats: null,
      errors: [],
      estimatedTimeRemaining: 0
    });
    processingStateRef.current = null;
  }, [abort, updateState]);

  const getErrorSummary = useCallback(() => {
    if (state.errors.length === 0) return null;
    return ErrorClassifier.createErrorSummary(state.errors);
  }, [state.errors]);

  const getHealthyProviders = useCallback(() => {
    return networkManager.getHealthyProviders();
  }, []);

  const getProviderHealth = useCallback((provider: ApiProvider) => {
    return networkManager.getProviderHealth(provider);
  }, []);

  return {
    ...state,
    processBulk,
    pause,
    resume,
    abort,
    reset,
    getErrorSummary,
    getHealthyProviders,
    getProviderHealth
  };
};