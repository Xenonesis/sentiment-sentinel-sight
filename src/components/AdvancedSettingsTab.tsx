import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Cpu, Sliders, RotateCcw, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ApiProvider,
  AdvancedSettings,
  getAdvancedSettings,
  updateAdvancedSettings,
  getCustomModel,
  setCustomModel,
  setTimeout as setApiTimeout,
  getTimeout
} from '@/services/apiPreferencesService';
import { getOllamaModels, isOllamaAvailable } from '@/services/ollamaService';

export const AdvancedSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AdvancedSettings>(getAdvancedSettings());
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isLoadingOllama, setIsLoadingOllama] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOllamaModels();
  }, []);

  const loadOllamaModels = async () => {
    setIsLoadingOllama(true);
    try {
      const available = await isOllamaAvailable();
      if (available) {
        const models = await getOllamaModels();
        setOllamaModels(models.map(m => m.name));
      }
    } catch (error) {
      console.error('Error loading Ollama models:', error);
    } finally {
      setIsLoadingOllama(false);
    }
  };

  const handleSettingsUpdate = (newSettings: Partial<AdvancedSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    updateAdvancedSettings(newSettings);
    toast({
      title: "Settings Updated",
      description: "Advanced settings have been saved successfully.",
    });
  };

  const handleTimeoutChange = (value: string) => {
    const timeout = parseInt(value) * 1000; // Convert to milliseconds
    if (!isNaN(timeout) && timeout >= 1000 && timeout <= 120000) {
      handleSettingsUpdate({ timeout });
    }
  };

  const handleRetryAttemptsChange = (value: number[]) => {
    handleSettingsUpdate({ retryAttempts: value[0] });
  };

  const handleCustomModelChange = (provider: ApiProvider, model: string) => {
    const newCustomModels = { ...settings.customModels, [provider]: model };
    handleSettingsUpdate({ customModels: newCustomModels });
  };

  const handleGeminiParameterChange = (param: string, value: number) => {
    const newParams = {
      ...settings.modelParameters,
      gemini: {
        ...settings.modelParameters.gemini,
        [param]: value
      }
    };
    handleSettingsUpdate({ modelParameters: newParams });
  };

  const handleOllamaParameterChange = (param: string, value: number) => {
    const newParams = {
      ...settings.modelParameters,
      ollama: {
        ...settings.modelParameters.ollama,
        [param]: value
      }
    };
    handleSettingsUpdate({ modelParameters: newParams });
  };

  const resetToDefaults = () => {
    const defaultSettings = getAdvancedSettings();
    setSettings(defaultSettings);
    updateAdvancedSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "Advanced settings have been reset to defaults.",
    });
  };

  const geminiModels = [
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro'
  ];

  const huggingfaceModels = [
    'cardiffnlp/twitter-roberta-base-sentiment-latest',
    'nlptown/bert-base-multilingual-uncased-sentiment',
    'distilbert-base-uncased-finetuned-sst-2-english',
    'j-hartmann/emotion-english-distilroberta-base'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Advanced Analysis Settings</h3>
        </div>
        <Button variant="outline" size="sm" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These settings control advanced behavior for API calls and model parameters. 
          Changes take effect immediately for new analysis requests.
        </AlertDescription>
      </Alert>

      {/* Timeout and Retry Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Request Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">API Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="120"
                value={settings.timeout / 1000}
                onChange={(e) => handleTimeoutChange(e.target.value)}
                placeholder="30"
              />
              <p className="text-sm text-muted-foreground">
                How long to wait for API responses (1-120 seconds)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Retry Attempts: {settings.retryAttempts}</Label>
              <Slider
                value={[settings.retryAttempts]}
                onValueChange={handleRetryAttemptsChange}
                max={5}
                min={0}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Number of retry attempts on failure (0-5)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Custom Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HuggingFace Model */}
            <div className="space-y-2">
              <Label>HuggingFace Model</Label>
              <Select
                value={settings.customModels.huggingface}
                onValueChange={(value) => handleCustomModelChange('huggingface', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {huggingfaceModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gemini Model */}
            <div className="space-y-2">
              <Label>Gemini Model</Label>
              <Select
                value={settings.customModels.gemini}
                onValueChange={(value) => handleCustomModelChange('gemini', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {geminiModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ollama Model */}
            <div className="space-y-2">
              <Label>Ollama Model</Label>
              <Select
                value={settings.customModels.ollama}
                onValueChange={(value) => handleCustomModelChange('ollama', value)}
                disabled={isLoadingOllama}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingOllama ? "Loading..." : "Select model"} />
                </SelectTrigger>
                <SelectContent>
                  {ollamaModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sentiment API Model */}
            <div className="space-y-2">
              <Label>Sentiment API Model</Label>
              <Select
                value={settings.customModels['sentiment-api']}
                onValueChange={(value) => handleCustomModelChange('sentiment-api', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hotels">Hotels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Model Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gemini Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              Gemini Parameters
              <Badge variant="secondary">Advanced</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {settings.modelParameters.gemini.temperature}</Label>
                <Slider
                  value={[settings.modelParameters.gemini.temperature]}
                  onValueChange={(value) => handleGeminiParameterChange('temperature', value[0])}
                  max={2}
                  min={0}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Controls randomness (0 = deterministic, 2 = very random)</p>
              </div>
              
              <div className="space-y-2">
                <Label>Top P: {settings.modelParameters.gemini.topP}</Label>
                <Slider
                  value={[settings.modelParameters.gemini.topP]}
                  onValueChange={(value) => handleGeminiParameterChange('topP', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Nucleus sampling threshold</p>
              </div>
              
              <div className="space-y-2">
                <Label>Top K: {settings.modelParameters.gemini.topK}</Label>
                <Slider
                  value={[settings.modelParameters.gemini.topK]}
                  onValueChange={(value) => handleGeminiParameterChange('topK', value[0])}
                  max={40}
                  min={1}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Number of top tokens to consider</p>
              </div>
              
              <div className="space-y-2">
                <Label>Max Output Tokens: {settings.modelParameters.gemini.maxOutputTokens}</Label>
                <Slider
                  value={[settings.modelParameters.gemini.maxOutputTokens]}
                  onValueChange={(value) => handleGeminiParameterChange('maxOutputTokens', value[0])}
                  max={1000}
                  min={50}
                  step={50}
                />
                <p className="text-xs text-muted-foreground">Maximum response length</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ollama Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              Ollama Parameters
              <Badge variant="secondary">Advanced</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {settings.modelParameters.ollama.temperature}</Label>
                <Slider
                  value={[settings.modelParameters.ollama.temperature]}
                  onValueChange={(value) => handleOllamaParameterChange('temperature', value[0])}
                  max={2}
                  min={0}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Controls randomness</p>
              </div>
              
              <div className="space-y-2">
                <Label>Top P: {settings.modelParameters.ollama.top_p}</Label>
                <Slider
                  value={[settings.modelParameters.ollama.top_p]}
                  onValueChange={(value) => handleOllamaParameterChange('top_p', value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Nucleus sampling threshold</p>
              </div>
              
              <div className="space-y-2">
                <Label>Top K: {settings.modelParameters.ollama.top_k}</Label>
                <Slider
                  value={[settings.modelParameters.ollama.top_k]}
                  onValueChange={(value) => handleOllamaParameterChange('top_k', value[0])}
                  max={100}
                  min={1}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Number of top tokens to consider</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};