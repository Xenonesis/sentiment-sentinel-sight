/**
 * Network Notifications Hook
 * Provides real-time notifications for network and provider status changes
 */
import { useEffect, useCallback } from 'react';
import { networkManager, NetworkState, ProviderHealth } from '@/utils/networkManager';
import { ApiProvider } from '@/services/apiPreferencesService';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface NotificationSettings {
  showNetworkChanges?: boolean;
  showProviderFailures?: boolean;
  showProviderRecovery?: boolean;
  showCircuitBreakerEvents?: boolean;
  showPerformanceAlerts?: boolean;
  minimumFailuresForNotification?: number;
  slowResponseThreshold?: number; // in milliseconds
}

const defaultSettings: NotificationSettings = {
  showNetworkChanges: true,
  showProviderFailures: true,
  showProviderRecovery: true,
  showCircuitBreakerEvents: true,
  showPerformanceAlerts: false, // Disabled by default to avoid spam
  minimumFailuresForNotification: 2,
  slowResponseThreshold: 5000
};

export const useNetworkNotifications = (settings: NotificationSettings = {}) => {
  const { toast } = useToast();
  const config = { ...defaultSettings, ...settings };
  
  // Track previous states to detect changes
  const previousStates = new Map<string, any>();

  const getProviderDisplayName = useCallback((provider: ApiProvider): string => {
    const names: Record<ApiProvider, string> = {
      'gemini': 'Google Gemini',
      'ollama': 'Ollama',
      'huggingface': 'HuggingFace',
      'sentiment-api': 'Sentiment API'
    };
    return names[provider] || provider;
  }, []);

  const handleNetworkChange = useCallback((networkState: NetworkState) => {
    if (!config.showNetworkChanges) return;

    const previousOnlineState = previousStates.get('network-online');
    
    if (previousOnlineState !== undefined && previousOnlineState !== networkState.isOnline) {
      if (networkState.isOnline) {
        toast({
          title: "🌐 Network Connected",
          description: "Internet connection restored. All network-dependent providers are now available.",
          duration: 4000,
        });
        logger.log('Network connection restored');
      } else {
        toast({
          title: "📡 Network Disconnected", 
          description: "Internet connection lost. Switching to offline-capable providers (Ollama, HuggingFace).",
          variant: "destructive",
          duration: 6000,
        });
        logger.warn('Network connection lost');
      }
    }
    
    previousStates.set('network-online', networkState.isOnline);
  }, [config.showNetworkChanges, toast, previousStates]);

  const handleProviderHealthChange = useCallback((provider: ApiProvider, health: ProviderHealth) => {
    const stateKey = `provider-${provider}`;
    const previousHealth = previousStates.get(stateKey);
    
    // Circuit breaker notifications
    if (config.showCircuitBreakerEvents && previousHealth) {
      if (!previousHealth.circuitBreakerOpen && health.circuitBreakerOpen) {
        toast({
          title: "⚡ Circuit Breaker Opened",
          description: `${getProviderDisplayName(provider)} has been temporarily disabled due to repeated failures. Will retry automatically.`,
          variant: "destructive",
          duration: 8000,
        });
        logger.warn(`Circuit breaker opened for ${provider}`);
      } else if (previousHealth.circuitBreakerOpen && !health.circuitBreakerOpen) {
        toast({
          title: "🔄 Circuit Breaker Closed",
          description: `${getProviderDisplayName(provider)} is now available again and ready for requests.`,
          duration: 5000,
        });
        logger.log(`Circuit breaker closed for ${provider}`);
      }
    }

    // Provider failure notifications
    if (config.showProviderFailures && health.consecutiveFailures >= config.minimumFailuresForNotification!) {
      const previousFailures = previousHealth?.consecutiveFailures || 0;
      
      if (health.consecutiveFailures > previousFailures && health.consecutiveFailures === config.minimumFailuresForNotification) {
        toast({
          title: "⚠️ Provider Issues Detected",
          description: `${getProviderDisplayName(provider)} is experiencing connectivity issues. Automatic fallback is active.`,
          variant: "destructive",
          duration: 6000,
        });
        logger.warn(`Provider ${provider} has ${health.consecutiveFailures} consecutive failures`);
      }
    }

    // Provider recovery notifications
    if (config.showProviderRecovery && previousHealth) {
      const wasUnhealthy = !previousHealth.isHealthy || previousHealth.consecutiveFailures > 0;
      const isNowHealthy = health.isHealthy && health.consecutiveFailures === 0;
      
      if (wasUnhealthy && isNowHealthy) {
        toast({
          title: "✅ Provider Recovered",
          description: `${getProviderDisplayName(provider)} is now working normally. Response time: ${Math.round(health.averageResponseTime)}ms`,
          duration: 4000,
        });
        logger.log(`Provider ${provider} has recovered`);
      }
    }

    // Performance alerts
    if (config.showPerformanceAlerts && health.averageResponseTime > config.slowResponseThreshold!) {
      const previousResponseTime = previousHealth?.averageResponseTime || 0;
      
      if (previousResponseTime <= config.slowResponseThreshold! && health.averageResponseTime > config.slowResponseThreshold!) {
        toast({
          title: "🐌 Slow Response Detected",
          description: `${getProviderDisplayName(provider)} is responding slowly (${Math.round(health.averageResponseTime)}ms). Consider switching providers.`,
          variant: "destructive",
          duration: 5000,
        });
        logger.warn(`Slow response time for ${provider}: ${health.averageResponseTime}ms`);
      }
    }

    previousStates.set(stateKey, { ...health });
  }, [config, toast, getProviderDisplayName, previousStates]);

  // Set up event listeners
  useEffect(() => {
    const unsubscribeNetwork = networkManager.onNetworkChange(handleNetworkChange);
    const unsubscribeHealth = networkManager.onHealthChange(handleProviderHealthChange);

    // Initialize previous states
    const currentNetworkState = networkManager.getNetworkState();
    previousStates.set('network-online', currentNetworkState.isOnline);

    const allProviderHealth = networkManager.getAllProviderHealth();
    allProviderHealth.forEach((health, provider) => {
      previousStates.set(`provider-${provider}`, { ...health });
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeHealth();
    };
  }, [handleNetworkChange, handleProviderHealthChange]);

  // Manual notification triggers for testing
  const triggerTestNotifications = useCallback(() => {
    toast({
      title: "🧪 Test Notification",
      description: "Network monitoring notifications are working correctly!",
      duration: 3000,
    });
  }, [toast]);

  const triggerProviderFailureTest = useCallback((provider: ApiProvider) => {
    // Simulate provider failure for testing
    networkManager.recordFailure(provider, new Error('Test failure for notification'));
    
    toast({
      title: "🧪 Simulated Provider Failure",
      description: `Triggered test failure for ${getProviderDisplayName(provider)}`,
      variant: "destructive",
      duration: 3000,
    });
  }, [toast, getProviderDisplayName]);

  const triggerNetworkOfflineTest = useCallback(() => {
    // Simulate network offline for testing
    window.dispatchEvent(new Event('offline'));
    
    setTimeout(() => {
      window.dispatchEvent(new Event('online'));
    }, 3000);
    
    toast({
      title: "🧪 Simulated Network Offline",
      description: "Testing offline/online transition (3 seconds)",
      duration: 4000,
    });
  }, [toast]);

  return {
    triggerTestNotifications,
    triggerProviderFailureTest,
    triggerNetworkOfflineTest,
    settings: config
  };
};