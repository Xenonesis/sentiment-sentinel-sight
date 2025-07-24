/**
 * Network Manager - Centralized network state and provider health management
 */
import { logger } from './logger';
import { ApiProvider } from '@/services/apiPreferencesService';

export interface ProviderHealth {
  isHealthy: boolean;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  averageResponseTime: number;
  circuitBreakerOpen: boolean;
  circuitBreakerOpenUntil: number | null;
}

export interface NetworkState {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number | null;
  rtt: number | null;
}

class NetworkManager {
  private networkState: NetworkState;
  private providerHealth: Map<ApiProvider, ProviderHealth> = new Map();
  private networkListeners: Set<(state: NetworkState) => void> = new Set();
  private healthListeners: Set<(provider: ApiProvider, health: ProviderHealth) => void> = new Set();
  
  // Circuit breaker configuration
  private readonly FAILURE_THRESHOLD = 3;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.networkState = this.getCurrentNetworkState();
    this.initializeProviderHealth();
    this.setupNetworkListeners();
    this.startHealthMonitoring();
  }

  private getCurrentNetworkState(): NetworkState {
    const connection = (navigator as any).connection;
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
    };
  }

  private initializeProviderHealth(): void {
    const providers: ApiProvider[] = ['huggingface', 'ollama', 'gemini', 'sentiment-api'];
    providers.forEach(provider => {
      this.providerHealth.set(provider, {
        isHealthy: true,
        consecutiveFailures: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        averageResponseTime: 0,
        circuitBreakerOpen: false,
        circuitBreakerOpenUntil: null,
      });
    });
  }

  private setupNetworkListeners(): void {
    const updateNetworkState = () => {
      const newState = this.getCurrentNetworkState();
      const wasOnline = this.networkState.isOnline;
      this.networkState = newState;
      
      if (!wasOnline && newState.isOnline) {
        // Network came back online - reset circuit breakers for network-dependent providers
        this.resetNetworkDependentProviders();
      }
      
      this.notifyNetworkListeners(newState);
    };

    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);
    
    // Listen for connection changes if supported
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkState);
    }
  }

  private resetNetworkDependentProviders(): void {
    const networkProviders: ApiProvider[] = ['gemini', 'sentiment-api'];
    networkProviders.forEach(provider => {
      const health = this.providerHealth.get(provider);
      if (health && health.circuitBreakerOpen) {
        health.circuitBreakerOpen = false;
        health.circuitBreakerOpenUntil = null;
        health.consecutiveFailures = 0;
        this.notifyHealthListeners(provider, health);
        logger.log(`Reset circuit breaker for ${provider} due to network recovery`);
      }
    });
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkCircuitBreakers();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private checkCircuitBreakers(): void {
    const now = Date.now();
    this.providerHealth.forEach((health, provider) => {
      if (health.circuitBreakerOpen && health.circuitBreakerOpenUntil && now > health.circuitBreakerOpenUntil) {
        // Circuit breaker timeout expired - allow half-open state
        health.circuitBreakerOpen = false;
        health.circuitBreakerOpenUntil = null;
        health.consecutiveFailures = Math.max(0, health.consecutiveFailures - 1);
        this.notifyHealthListeners(provider, health);
        logger.log(`Circuit breaker for ${provider} moved to half-open state`);
      }
    });
  }

  // Public API
  public getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  public isProviderHealthy(provider: ApiProvider): boolean {
    const health = this.providerHealth.get(provider);
    if (!health) return false;
    
    // Check if circuit breaker is open
    if (health.circuitBreakerOpen) return false;
    
    // Check if provider requires network and we're offline
    if (!this.networkState.isOnline && this.isNetworkDependent(provider)) {
      return false;
    }
    
    return health.isHealthy;
  }

  public recordSuccess(provider: ApiProvider, responseTime: number): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.isHealthy = true;
    health.consecutiveFailures = 0;
    health.lastSuccessTime = Date.now();
    health.circuitBreakerOpen = false;
    health.circuitBreakerOpenUntil = null;
    
    // Update average response time
    if (health.averageResponseTime === 0) {
      health.averageResponseTime = responseTime;
    } else {
      health.averageResponseTime = (health.averageResponseTime * 0.8) + (responseTime * 0.2);
    }

    this.notifyHealthListeners(provider, health);
    logger.debug(`Recorded success for ${provider}, response time: ${responseTime}ms`);
  }

  public recordFailure(provider: ApiProvider, error: Error): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.consecutiveFailures++;
    health.lastFailureTime = Date.now();
    
    // Open circuit breaker if threshold reached
    if (health.consecutiveFailures >= this.FAILURE_THRESHOLD) {
      health.circuitBreakerOpen = true;
      health.circuitBreakerOpenUntil = Date.now() + this.CIRCUIT_BREAKER_TIMEOUT;
      health.isHealthy = false;
      logger.warn(`Circuit breaker opened for ${provider} after ${health.consecutiveFailures} failures`);
    }

    this.notifyHealthListeners(provider, health);
    logger.debug(`Recorded failure for ${provider}: ${error.message}`);
  }

  public getProviderHealth(provider: ApiProvider): ProviderHealth | null {
    const health = this.providerHealth.get(provider);
    return health ? { ...health } : null;
  }

  public getAllProviderHealth(): Map<ApiProvider, ProviderHealth> {
    const result = new Map();
    this.providerHealth.forEach((health, provider) => {
      result.set(provider, { ...health });
    });
    return result;
  }

  public getHealthyProviders(): ApiProvider[] {
    const healthy: ApiProvider[] = [];
    this.providerHealth.forEach((health, provider) => {
      if (this.isProviderHealthy(provider)) {
        healthy.push(provider);
      }
    });
    return healthy;
  }

  public getOfflineCapableProviders(): ApiProvider[] {
    return ['huggingface', 'ollama']; // These can work offline
  }

  public getBestProvider(availableProviders: ApiProvider[]): ApiProvider | null {
    const healthyProviders = availableProviders.filter(p => this.isProviderHealthy(p));
    
    if (healthyProviders.length === 0) {
      return null;
    }

    // If offline, prefer offline-capable providers
    if (!this.networkState.isOnline) {
      const offlineCapable = healthyProviders.filter(p => this.getOfflineCapableProviders().includes(p));
      if (offlineCapable.length > 0) {
        return this.selectBestByPerformance(offlineCapable);
      }
    }

    return this.selectBestByPerformance(healthyProviders);
  }

  private selectBestByPerformance(providers: ApiProvider[]): ApiProvider {
    // Sort by average response time (lower is better)
    return providers.sort((a, b) => {
      const healthA = this.providerHealth.get(a);
      const healthB = this.providerHealth.get(b);
      if (!healthA || !healthB) return 0;
      return healthA.averageResponseTime - healthB.averageResponseTime;
    })[0];
  }

  private isNetworkDependent(provider: ApiProvider): boolean {
    return ['gemini', 'sentiment-api'].includes(provider);
  }

  // Event listeners
  public onNetworkChange(listener: (state: NetworkState) => void): () => void {
    this.networkListeners.add(listener);
    return () => this.networkListeners.delete(listener);
  }

  public onHealthChange(listener: (provider: ApiProvider, health: ProviderHealth) => void): () => void {
    this.healthListeners.add(listener);
    return () => this.healthListeners.delete(listener);
  }

  private notifyNetworkListeners(state: NetworkState): void {
    this.networkListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logger.error('Error in network listener:', error);
      }
    });
  }

  private notifyHealthListeners(provider: ApiProvider, health: ProviderHealth): void {
    this.healthListeners.forEach(listener => {
      try {
        listener(provider, health);
      } catch (error) {
        logger.error('Error in health listener:', error);
      }
    });
  }

  // Manual health check for testing
  public async performHealthCheck(provider: ApiProvider): Promise<boolean> {
    // This would implement actual health checks for each provider
    // For now, just return current health status
    return this.isProviderHealthy(provider);
  }

  // Reset all health data (useful for testing or manual reset)
  public resetAllHealth(): void {
    this.initializeProviderHealth();
    logger.log('Reset all provider health data');
  }
}

// Singleton instance
export const networkManager = new NetworkManager();