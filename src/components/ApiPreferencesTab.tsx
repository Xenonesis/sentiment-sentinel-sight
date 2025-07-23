import React from 'react';
import { logger } from '@/utils/logger';
import { motion } from 'framer-motion';
import { Settings, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useApiPreferences } from '@/hooks/useApiPreferences';
import { useToast } from '@/hooks/use-toast';
import {
  ApiProvider,
  getProviderDisplayName,
  getProviderDescription
} from '@/services/apiPreferencesService';
import { isGeminiConfigured } from '@/services/geminiService';
import { isOllamaConfigured, isOllamaAvailable, getOllamaModels } from '@/services/ollamaService';

interface ApiPreferencesTabProps {
  onProviderConfigClick: (provider: ApiProvider) => void;
}

export const ApiPreferencesTab: React.FC<ApiPreferencesTabProps> = ({ onProviderConfigClick }) => {
  const {
    preferences,
    updateDefaultProvider,
    toggleProvider,
    updateProviderOrder,
    toggleModel,
    resetPreferences,
    checkProviderEnabled
  } = useApiPreferences();
  
  const { toast } = useToast();
  const [ollamaModels, setOllamaModels] = React.useState<any[]>([]);
  const [ollamaAvailable, setOllamaAvailable] = React.useState(false);

  React.useEffect(() => {
    const checkOllama = async () => {
      try {
        const available = await isOllamaAvailable();
        setOllamaAvailable(available);
        
        if (available) {
          const models = await getOllamaModels();
          setOllamaModels(models);
        }
      } catch (error) {
        logger.error('Error checking Ollama:', error);
      }
    };
    
    checkOllama();
  }, []);

  const moveProvider = (provider: ApiProvider, direction: 'up' | 'down') => {
    const currentOrder = [...preferences.providerOrder];
    const index = currentOrder.indexOf(provider);
    
    if (direction === 'up' && index > 0) {
      [currentOrder[index], currentOrder[index - 1]] = [currentOrder[index - 1], currentOrder[index]];
    } else if (direction === 'down' && index < currentOrder.length - 1) {
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
    }
    
    updateProviderOrder(currentOrder);
  };

  const setAsDefault = (provider: ApiProvider) => {
    updateDefaultProvider(provider);
    toast({
      title: "Default Provider Updated",
      description: `${getProviderDisplayName(provider)} is now your default provider.`
    });
  };

  const getProviderStatus = (provider: ApiProvider) => {
    switch (provider) {
      case 'huggingface':
        return { configured: true, available: true };
      case 'ollama':
        return { configured: isOllamaConfigured(), available: ollamaAvailable };
      case 'gemini':
        return { configured: isGeminiConfigured(), available: isGeminiConfigured() };
      case 'sentiment-api':
        return { configured: true, available: true };
      default:
        return { configured: false, available: false };
    }
  };

  const handleReset = () => {
    resetPreferences();
    toast({
      title: "Preferences Reset",
      description: "API preferences have been reset to defaults."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">API Provider Preferences</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="bg-muted/30 border-border/50">
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Configure which API providers to use and their priority order. The app will try providers 
          in order until one succeeds. Disabled providers will be skipped entirely.
        </AlertDescription>
      </Alert>

      {/* Provider List */}
      <div className="space-y-4">
        <h4 className="font-medium">Provider Priority Order</h4>
        
        {preferences.providerOrder.map((provider, index) => {
          const status = getProviderStatus(provider);
          const isEnabled = checkProviderEnabled(provider);
          const isDefault = preferences.defaultProvider === provider;
          
          return (
            <motion.div
              key={provider}
              layout
              className="group"
            >
              <Card className={`transition-all ${isEnabled ? 'bg-muted/20' : 'bg-muted/10 opacity-60'} ${isDefault ? 'ring-2 ring-primary/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Priority Number */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Provider Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{getProviderDisplayName(provider)}</h5>
                          {isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {status.configured && status.available && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Ready
                            </Badge>
                          )}
                          {status.configured && !status.available && (
                            <Badge variant="outline" className="text-yellow-600">
                              Configured
                            </Badge>
                          )}
                          {!status.configured && (
                            <Badge variant="outline" className="text-red-600">
                              Not Configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getProviderDescription(provider)}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${provider}-enabled`} className="text-sm">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`${provider}-enabled`}
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleProvider(provider, checked)}
                        />
                      </div>

                      {/* Set as Default */}
                      {isEnabled && !isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(provider)}
                        >
                          Set Default
                        </Button>
                      )}

                      {/* Configure Button */}
                      {!status.configured && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProviderConfigClick(provider)}
                        >
                          Configure
                        </Button>
                      )}

                      {/* Move Up/Down */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveProvider(provider, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveProvider(provider, 'down')}
                          disabled={index === preferences.providerOrder.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Ollama Models Section */}
      {ollamaAvailable && ollamaModels.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Ollama Models</h4>
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-sm">Available Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ollamaModels.map((model) => (
                <div key={model.name} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </div>
                  </div>
                  <Switch
                    checked={preferences.enabledModels[model.name] ?? true}
                    onCheckedChange={(checked) => toggleModel(model.name, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Configuration Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Default Provider:</strong> {getProviderDisplayName(preferences.defaultProvider)}
          </div>
          <div className="text-sm">
            <strong>Enabled Providers:</strong> {
              preferences.providerOrder
                .filter(p => checkProviderEnabled(p))
                .map(p => getProviderDisplayName(p))
                .join(', ') || 'None'
            }
          </div>
          {ollamaModels.length > 0 && (
            <div className="text-sm">
              <strong>Enabled Ollama Models:</strong> {
                ollamaModels
                  .filter(m => preferences.enabledModels[m.name] ?? true)
                  .map(m => m.name)
                  .join(', ') || 'None'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};