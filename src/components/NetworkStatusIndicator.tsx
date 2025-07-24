/**
 * Network Status and Provider Health Indicator
 */
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { networkManager, NetworkState, ProviderHealth } from '@/utils/networkManager';
import { ApiProvider } from '@/services/apiPreferencesService';

interface NetworkStatusIndicatorProps {
  compact?: boolean;
  showProviderHealth?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  compact = false,
  showProviderHealth = true
}) => {
  const [networkState, setNetworkState] = useState<NetworkState>(networkManager.getNetworkState());
  const [providerHealth, setProviderHealth] = useState<Map<ApiProvider, ProviderHealth>>(
    networkManager.getAllProviderHealth()
  );

  useEffect(() => {
    const unsubscribeNetwork = networkManager.onNetworkChange(setNetworkState);
    const unsubscribeHealth = networkManager.onHealthChange((provider, health) => {
      setProviderHealth(prev => new Map(prev.set(provider, health)));
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeHealth();
    };
  }, []);

  const getProviderStatusIcon = (health: ProviderHealth) => {
    if (health.circuitBreakerOpen) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (health.isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getProviderStatusText = (health: ProviderHealth) => {
    if (health.circuitBreakerOpen) {
      return 'Circuit Breaker Open';
    }
    if (health.isHealthy) {
      return 'Healthy';
    }
    return `${health.consecutiveFailures} failures`;
  };

  const getProviderDisplayName = (provider: ApiProvider) => {
    const names: Record<ApiProvider, string> = {
      'gemini': 'Gemini',
      'ollama': 'Ollama',
      'huggingface': 'HuggingFace',
      'sentiment-api': 'Sentiment API'
    };
    return names[provider] || provider;
  };

  const resetProviderHealth = () => {
    networkManager.resetAllHealth();
  };

  const testNetworkMonitoring = () => {
    // Trigger test notifications
    if ((window as any).runNetworkTests) {
      (window as any).runNetworkTests();
    } else {
      // Fallback: simple test
      networkManager.recordFailure('gemini', new Error('Test failure'));
      setTimeout(() => {
        networkManager.recordSuccess('gemini', 500);
      }, 2000);
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {networkState.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <p>Network: {networkState.isOnline ? 'Online' : 'Offline'}</p>
              {showProviderHealth && (
                <div className="space-y-1">
                  {Array.from(providerHealth.entries()).map(([provider, health]) => (
                    <div key={provider} className="flex items-center gap-2 text-sm">
                      {getProviderStatusIcon(health)}
                      <span>{getProviderDisplayName(provider)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {networkState.isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={networkState.isOnline ? "default" : "destructive"} className="ml-2">
              {networkState.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Connection:</span>
            <span className="ml-2">{networkState.effectiveType || 'Unknown'}</span>
          </div>
        </div>

        {showProviderHealth && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Provider Health</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetProviderHealth}>
                  Reset All
                </Button>
                <Button variant="outline" size="sm" onClick={testNetworkMonitoring}>
                  Test Monitoring
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {Array.from(providerHealth.entries()).map(([provider, health]) => (
                <div key={provider} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    {getProviderStatusIcon(health)}
                    <span className="text-sm font-medium">
                      {getProviderDisplayName(provider)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getProviderStatusText(health)}</span>
                    {health.averageResponseTime > 0 && (
                      <span>({Math.round(health.averageResponseTime)}ms)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!networkState.isOnline && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You're currently offline. Only local AI models (Ollama, HuggingFace) will work.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};