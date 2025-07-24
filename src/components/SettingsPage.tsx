import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { motion } from 'framer-motion';
import { Settings, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, Database, Trash2, Download, X, CloudLightning, RotateCcw, Sliders, ChevronLeft, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePersistedSentiments } from '@/hooks/usePersistedSentiments';
import { useDataExport } from '@/hooks/useDataExport';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { useResponsive } from '@/hooks/useResponsive';
import { ApiPreferencesTab } from '@/components/ApiPreferencesTab';
import { AdvancedSettingsTab } from '@/components/AdvancedSettingsTab';
import { 
  getResponsiveSpacing, 
  getResponsiveGap, 
  getResponsiveButtonSize, 
  getTouchFriendlyClasses,
  getResponsiveCardPadding,
  getResponsiveTextSize,
  getResponsiveIconSize,
  getResponsiveHeaderPadding
} from '@/utils/mobileOptimizations';
import { ApiProvider } from '@/services/apiPreferencesService';
import { 
  getOllamaModels, 
  isOllamaAvailable, 
  testOllamaModel, 
  getConfiguredOllamaModel, 
  setConfiguredOllamaModel,
  isRecommendedModel,
  type OllamaModel 
} from '@/services/ollamaService';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage = ({ onClose }: SettingsPageProps) => {
  // Responsive state
  const isMobile = useIsMobile();
  const { device } = useResponsive();
  const [activeTab, setActiveTab] = useState('preferences');
  
  // Gemini API settings
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGeminiKey, setIsTestingGeminiKey] = useState(false);
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<'valid' | 'invalid' | 'untested'>('untested');
  
  // Sentiment API settings
  const [sentimentApiKey, setSentimentApiKey] = useState('');
  const [showSentimentKey, setShowSentimentKey] = useState(false);
  const [isTestingSentimentKey, setIsTestingSentimentKey] = useState(false);
  const [sentimentKeyStatus, setSentimentKeyStatus] = useState<'valid' | 'invalid' | 'untested'>('untested');
  
  // Ollama settings
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('');
  const [isLoadingOllamaModels, setIsLoadingOllamaModels] = useState(false);
  const [isTestingOllamaModel, setIsTestingOllamaModel] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [ollamaModelStatus, setOllamaModelStatus] = useState<'valid' | 'invalid' | 'untested'>('untested');
  
  const { toast } = useToast();
  
  // Data management hooks
  const { sentiments, clearHistory, getStorageInfo } = usePersistedSentiments();
  const { exportData } = useDataExport();
  const { settings: userSettings, updateFormSettings, updateUISettings, updateAnalysisSettings, clearFormData, resetSettings } = useUserSettings();

  // Tab configuration for better mobile experience
  const tabs = [
    { id: 'preferences', label: 'Preferences', shortLabel: 'Prefs', icon: Settings },
    { id: 'api', label: 'API Keys', shortLabel: 'APIs', icon: Key },
    { id: 'advanced', label: 'Advanced', shortLabel: 'Adv', icon: Sliders },
    { id: 'data', label: 'Data', shortLabel: 'Data', icon: Database }
  ];

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
      setGeminiKeyStatus('valid'); // Assume it's valid if saved
    }
    
    const savedSentimentKey = localStorage.getItem('sentiment_api_key');
    if (savedSentimentKey) {
      setSentimentApiKey(savedSentimentKey);
      setSentimentKeyStatus('valid'); // Assume it's valid if saved
    }
    
    // Load saved Ollama model
    const savedOllamaModel = getConfiguredOllamaModel();
    if (savedOllamaModel) {
      setSelectedOllamaModel(savedOllamaModel);
      setOllamaModelStatus('valid'); // Assume it's valid if saved
    }
    
    // Check Ollama availability and load models
    checkOllamaAvailability();
  }, []);

  const checkOllamaAvailability = async () => {
    try {
      const available = await isOllamaAvailable();
      setOllamaAvailable(available);
      
      if (available) {
        await loadOllamaModels();
      }
    } catch (error) {
      logger.error('Error checking Ollama availability:', error);
      setOllamaAvailable(false);
    }
  };

  const loadOllamaModels = async () => {
    setIsLoadingOllamaModels(true);
    try {
      const models = await getOllamaModels();
      setOllamaModels(models);
    } catch (error) {
      logger.error('Error loading Ollama models:', error);
      toast({
        title: "Error",
        description: "Failed to load Ollama models. Make sure Ollama is running.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOllamaModels(false);
    }
  };

  const testGeminiApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setGeminiKeyStatus('invalid');
      return false;
    }

    setIsTestingGeminiKey(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Test connection - just respond with 'OK'"
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        setGeminiKeyStatus('valid');
        return true;
      } else {
        setGeminiKeyStatus('invalid');
        return false;
      }
    } catch (error) {
      setGeminiKeyStatus('invalid');
      return false;
    } finally {
      setIsTestingGeminiKey(false);
    }
  };

  const testSentimentApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setSentimentKeyStatus('invalid');
      return false;
    }

    setIsTestingSentimentKey(true);
    try {
      // Test the MeaningCloud API with the provided key
      const params = new URLSearchParams({
        key: apiKey,
        txt: 'This is a test message.',
        lang: 'en',
        model: 'general'
      });

      const response = await fetch(`https://api.meaningcloud.com/sentiment-2.1?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const data = await response.json();

      if (response.ok && data.status && data.status.code === '0') {
        setSentimentKeyStatus('valid');
        return true;
      } else {
        setSentimentKeyStatus('invalid');
        return false;
      }
    } catch (error) {
      setSentimentKeyStatus('invalid');
      return false;
    } finally {
      setIsTestingSentimentKey(false);
    }
  };

  const saveGeminiApiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid Gemini API key"
      });
      return;
    }

    const isValid = await testGeminiApiKey(geminiApiKey);
    
    if (isValid) {
      localStorage.setItem('gemini_api_key', geminiApiKey);
      toast({
        title: "Success",
        description: "Gemini API key saved and validated successfully!"
      });
    } else {
      toast({
        variant: "destructive", 
        title: "Invalid API Key",
        description: "The Gemini API key you entered is not valid. Please check and try again."
      });
    }
  };

  const saveSentimentApiKey = async () => {
    if (!sentimentApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid Sentiment API key"
      });
      return;
    }

    const isValid = await testSentimentApiKey(sentimentApiKey);
    
    if (isValid) {
      localStorage.setItem('sentiment_api_key', sentimentApiKey);
      toast({
        title: "Success",
        description: "Sentiment API key saved and validated successfully!"
      });
    } else {
      toast({
        variant: "destructive", 
        title: "Invalid API Key",
        description: "The Sentiment API key you entered is not valid. Please check and try again."
      });
    }
  };

  const clearGeminiApiKey = () => {
    setGeminiApiKey('');
    setGeminiKeyStatus('untested');
    localStorage.removeItem('gemini_api_key');
    toast({
      title: "API Key Cleared",
      description: "Your Gemini API key has been removed."
    });
  };

  const clearSentimentApiKey = () => {
    setSentimentApiKey('');
    setSentimentKeyStatus('untested');
    localStorage.removeItem('sentiment_api_key');
    toast({
      title: "API Key Cleared",
      description: "Your Sentiment API key has been removed."
    });
  };

  const saveOllamaModel = async () => {
    if (!selectedOllamaModel.trim()) {
      toast({
        title: "No Model Selected",
        description: "Please select an Ollama model"
      });
      return;
    }

    setIsTestingOllamaModel(true);
    setOllamaModelStatus('untested');

    try {
      const isValid = await testOllamaModel(selectedOllamaModel);
      
      if (isValid) {
        setConfiguredOllamaModel(selectedOllamaModel);
        setOllamaModelStatus('valid');
        
        toast({
          title: "Model Configured",
          description: `Ollama model "${selectedOllamaModel}" configured successfully!`
        });
      } else {
        setOllamaModelStatus('invalid');
        toast({
          title: "Model Test Failed",
          description: `The model "${selectedOllamaModel}" is not working properly. Please try a different model.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setOllamaModelStatus('invalid');
      toast({
        title: "Configuration Failed",
        description: error instanceof Error ? error.message : "Failed to configure Ollama model",
        variant: "destructive"
      });
    } finally {
      setIsTestingOllamaModel(false);
    }
  };

  const clearOllamaModel = () => {
    setSelectedOllamaModel('');
    setOllamaModelStatus('untested');
    localStorage.removeItem('ollama_model');
    
    toast({
      title: "Model Removed",
      description: "Your Ollama model configuration has been removed."
    });
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      clearHistory();
      toast({
        title: "Data Cleared",
        description: "All sentiment analysis history has been cleared."
      });
    }
  };

  const handleQuickExport = (format: 'csv' | 'json') => {
    try {
      const result = exportData(sentiments, { format });
      toast({
        title: "Export Successful",
        description: `Exported ${result.exportedCount} records as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-1 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-[98vh] sm:h-[95vh] lg:h-[90vh] overflow-hidden flex flex-col"
      >
        <Card className="bg-gradient-card border-border/50 shadow-glow flex flex-col h-full">
          <CardHeader className={`flex flex-row items-center justify-between ${getResponsiveHeaderPadding()} flex-shrink-0`}>
            <CardTitle className="flex items-center gap-2">
              <Settings className={`${getResponsiveIconSize('md')} text-primary`} />
              <span className={getResponsiveTextSize('lg')}>Settings</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size={isMobile ? "default" : "sm"} 
              onClick={onClose}
              className={getTouchFriendlyClasses()}
            >
              <X className={getResponsiveIconSize('sm')} />
            </Button>
          </CardHeader>
          <CardContent className={`${getResponsiveCardPadding()} flex-1 overflow-hidden`}>
            <Tabs defaultValue="preferences" className={`${getResponsiveGap('md')} flex flex-col h-full`}>
              {/* Mobile: Scrollable horizontal tabs, Desktop: Grid layout */}
              <div className="flex-shrink-0">
                {isMobile ? (
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="flex w-max min-w-full gap-1 p-1">
                      <TabsTrigger value="preferences" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <Settings className="h-4 w-4" />
                        Preferences
                      </TabsTrigger>
                      <TabsTrigger value="api" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <Key className="h-4 w-4" />
                        Gemini API
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <Sliders className="h-4 w-4" />
                        Advanced
                      </TabsTrigger>
                      <TabsTrigger value="ollama" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <Settings className="h-4 w-4" />
                        Ollama
                      </TabsTrigger>
                      <TabsTrigger value="sentiment" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <CloudLightning className="h-4 w-4" />
                        Sentiment API
                      </TabsTrigger>
                      <TabsTrigger value="data" className={`flex items-center gap-2 ${getTouchFriendlyClasses()} px-3 py-2 text-sm whitespace-nowrap`}>
                        <Database className="h-4 w-4" />
                        Data
                      </TabsTrigger>
                    </TabsList>
                  </div>
                ) : (
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
                    <TabsTrigger value="preferences" className="flex items-center gap-2 text-sm">
                      <Settings className="h-4 w-4" />
                      <span className="hidden lg:inline">Preferences</span>
                      <span className="lg:hidden">Prefs</span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex items-center gap-2 text-sm">
                      <Key className="h-4 w-4" />
                      <span className="hidden lg:inline">Gemini API</span>
                      <span className="lg:hidden">Gemini</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2 text-sm">
                      <Sliders className="h-4 w-4" />
                      <span className="hidden lg:inline">Advanced</span>
                      <span className="lg:hidden">Adv</span>
                    </TabsTrigger>
                    <TabsTrigger value="ollama" className="flex items-center gap-2 text-sm">
                      <Settings className="h-4 w-4" />
                      <span className="hidden lg:inline">Ollama</span>
                      <span className="lg:hidden">Local</span>
                    </TabsTrigger>
                    <TabsTrigger value="sentiment" className="flex items-center gap-2 text-sm">
                      <CloudLightning className="h-4 w-4" />
                      <span className="hidden lg:inline">Sentiment API</span>
                      <span className="lg:hidden">API</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      <span className="hidden lg:inline">Data Management</span>
                      <span className="lg:hidden">Data</span>
                    </TabsTrigger>
                  </TabsList>
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <TabsContent value="preferences" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                  {/* User Preferences Section */}
                  <Card>
                    <CardHeader className={getResponsiveHeaderPadding()}>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className={getResponsiveIconSize('md')} />
                        <span className={getResponsiveTextSize('lg')}>User Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={`${getResponsiveCardPadding()} ${getResponsiveGap('lg')}`}>
                      {/* Form Data Settings */}
                      <div className={getResponsiveGap('md')}>
                        <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Form Data</h3>
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Remember Form Data</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Automatically save and restore customer ID, channel, and message content
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.form.rememberFormData}
                              onCheckedChange={(checked) => updateFormSettings({ rememberFormData: checked })}
                            />
                          </div>
                        </div>
                      
                        {userSettings.form.rememberFormData && (
                          <div className={`${isMobile ? 'pl-2 border-l-2' : 'pl-4 border-l-2'} border-muted ${getResponsiveGap('sm')}`}>
                            <div className={getResponsiveTextSize('sm')}>
                              <strong>Last Customer ID:</strong> {userSettings.form.lastCustomerId || 'None'}
                            </div>
                            <div className={getResponsiveTextSize('sm')}>
                              <strong>Last Channel:</strong> {userSettings.form.lastChannel || 'None'}
                            </div>
                            <div className={getResponsiveTextSize('sm')}>
                              <strong>Last Message:</strong> {userSettings.form.lastMessage ? 
                                `${userSettings.form.lastMessage.substring(0, isMobile ? 30 : 50)}${userSettings.form.lastMessage.length > (isMobile ? 30 : 50) ? '...' : ''}` : 'None'}
                            </div>
                            <Button 
                              variant="outline" 
                              size={isMobile ? "default" : "sm"}
                              onClick={clearFormData}
                              className={`mt-2 ${getTouchFriendlyClasses()}`}
                            >
                              <Trash2 className={`${getResponsiveIconSize('sm')} mr-2`} />
                              <span className={getResponsiveTextSize('sm')}>Clear Saved Form Data</span>
                            </Button>
                          </div>
                        )}
                    </div>

                    <Separator />

                      {/* UI Settings */}
                      <div className={getResponsiveGap('md')}>
                        <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Interface</h3>
                        
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Auto-save Results</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Automatically save analysis results to history
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.ui.autoSaveResults}
                              onCheckedChange={(checked) => updateUISettings({ autoSaveResults: checked })}
                            />
                          </div>
                        </div>

                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Show Tooltips</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Display helpful tooltips throughout the interface
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.ui.showTooltips}
                              onCheckedChange={(checked) => updateUISettings({ showTooltips: checked })}
                            />
                          </div>
                        </div>

                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Compact Mode</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Use a more compact layout to fit more content
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.ui.compactMode}
                              onCheckedChange={(checked) => updateUISettings({ compactMode: checked })}
                            />
                          </div>
                        </div>
                      </div>

                    <Separator />

                      {/* Analysis Settings */}
                      <div className={getResponsiveGap('md')}>
                        <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Analysis Defaults</h3>
                        
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Auto-analyze on Paste</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Automatically analyze text when pasted into the message field
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.analysis.autoAnalyzeOnPaste}
                              onCheckedChange={(checked) => updateAnalysisSettings({ autoAnalyzeOnPaste: checked })}
                            />
                          </div>
                        </div>

                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Show Detailed Results</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Display additional analysis details and confidence scores
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.analysis.showDetailedResults}
                              onCheckedChange={(checked) => updateAnalysisSettings({ showDetailedResults: checked })}
                            />
                          </div>
                        </div>

                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Enable Batch Mode</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Allow processing multiple messages at once
                            </p>
                          </div>
                          <div className={`${isMobile ? 'self-start' : ''}`}>
                            <Switch
                              checked={userSettings.analysis.enableBatchMode}
                              onCheckedChange={(checked) => updateAnalysisSettings({ enableBatchMode: checked })}
                            />
                          </div>
                        </div>

                        <div className={getResponsiveGap('sm')}>
                          <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Confidence Threshold</Label>
                          <p className={`${getResponsiveTextSize('xs')} text-muted-foreground mb-2`}>
                            Minimum confidence level for analysis results (0.1 - 1.0)
                          </p>
                          <div className={`flex items-center ${getResponsiveGap('md')}`}>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.1"
                              value={userSettings.analysis.defaultConfidenceThreshold}
                              onChange={(e) => updateAnalysisSettings({ defaultConfidenceThreshold: parseFloat(e.target.value) })}
                              className={`flex-1 ${getTouchFriendlyClasses()}`}
                            />
                            <Badge variant="outline" className={`min-w-[60px] text-center ${getResponsiveTextSize('sm')}`}>
                              {(userSettings.analysis.defaultConfidenceThreshold * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>

                        <div className={getResponsiveGap('sm')}>
                          <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Max History Items</Label>
                          <p className={`${getResponsiveTextSize('xs')} text-muted-foreground mb-2`}>
                            Maximum number of analysis results to keep in history
                          </p>
                          <div className={`flex items-center ${getResponsiveGap('md')}`}>
                            <input
                              type="range"
                              min="100"
                              max="5000"
                              step="100"
                              value={userSettings.analysis.maxHistoryItems}
                              onChange={(e) => updateAnalysisSettings({ maxHistoryItems: parseInt(e.target.value) })}
                              className={`flex-1 ${getTouchFriendlyClasses()}`}
                            />
                            <Badge variant="outline" className={`min-w-[80px] text-center ${getResponsiveTextSize('sm')}`}>
                              {userSettings.analysis.maxHistoryItems}
                            </Badge>
                          </div>
                        </div>
                    </div>

                    <Separator />

                      {/* Reset Settings */}
                      <div className={getResponsiveGap('md')}>
                        <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Reset</h3>
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                          <div className={getResponsiveGap('xs')}>
                            <Label className={`${getResponsiveTextSize('sm')} font-medium`}>Reset All Preferences</Label>
                            <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                              Reset all user preferences to default values
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size={isMobile ? "default" : "sm"}
                            onClick={() => {
                              if (confirm('Are you sure you want to reset all preferences? This cannot be undone.')) {
                                resetSettings();
                                toast({
                                  title: "Preferences Reset",
                                  description: "All user preferences have been reset to defaults."
                                });
                              }
                            }}
                            className={`${getTouchFriendlyClasses()} ${isMobile ? 'self-start' : ''}`}
                          >
                            <RotateCcw className={`${getResponsiveIconSize('sm')} mr-2`} />
                            <span className={getResponsiveTextSize('sm')}>Reset Preferences</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                {/* API Preferences Section */}
                <ApiPreferencesTab 
                  onProviderConfigClick={(provider: ApiProvider) => {
                    // Switch to the appropriate tab based on provider
                    const tabMap: Record<ApiProvider, string> = {
                      'huggingface': 'preferences', // No specific config needed
                      'ollama': 'ollama',
                      'gemini': 'api',
                      'sentiment-api': 'sentiment'
                    };
                    
                    const targetTab = tabMap[provider];
                    if (targetTab && targetTab !== 'preferences') {
                      // You would need to implement tab switching here
                      // For now, show a toast with instructions
                      toast({
                        title: "Configuration Required",
                        description: `Please switch to the ${targetTab === 'api' ? 'Gemini API' : targetTab === 'ollama' ? 'Ollama' : 'Sentiment API'} tab to configure this provider.`
                      });
                    }
                  }}
                />
              </TabsContent>

                <TabsContent value="advanced" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                  <AdvancedSettingsTab />
                </TabsContent>

                <TabsContent value="api" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                  {/* API Key Section */}
                  <div className={getResponsiveGap('md')}>
                    <div className="flex items-center gap-2">
                      <Key className={`${getResponsiveIconSize('sm')} text-primary`} />
                      <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Google Gemini API Key</h3>
                    </div>
                    
                    <Alert className="bg-muted/30 border-border/50">
                      <AlertCircle className={getResponsiveIconSize('sm')} />
                      <AlertDescription className={getResponsiveTextSize('sm')}>
                        Enter your Google Gemini API key to enable sentiment analysis with Gemini 2.0 Flash when HuggingFace models are unavailable. 
                        Get your free API key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                      </AlertDescription>
                    </Alert>

                    <div className={getResponsiveGap('sm')}>
                      <Label htmlFor="geminiKey" className={getResponsiveTextSize('sm')}>API Key</Label>
                      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${getResponsiveGap('sm')}`}>
                        <div className="relative flex-1">
                          <Input
                            id="geminiKey"
                            type={showGeminiKey ? "text" : "password"}
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key..."
                            className={`pr-10 ${getTouchFriendlyClasses()}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent ${getTouchFriendlyClasses()}`}
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                          >
                          {showGeminiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {geminiKeyStatus === 'valid' && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {geminiKeyStatus === 'invalid' && (
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={saveGeminiApiKey}
                      disabled={isTestingGeminiKey || !geminiApiKey.trim()}
                      className={`bg-gradient-sentiment ${getTouchFriendlyClasses()}`}
                    >
                      {isTestingGeminiKey ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Save className={getResponsiveIconSize('sm')} />
                          </motion.div>
                          <span className={getResponsiveTextSize('sm')}>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Save className={`mr-2 ${getResponsiveIconSize('sm')}`} />
                          <span className={getResponsiveTextSize('sm')}>Save & Test</span>
                        </>
                      )}
                    </Button>
                    
                    {geminiApiKey && (
                      <Button
                        variant="outline"
                        onClick={clearGeminiApiKey}
                        className={getTouchFriendlyClasses()}
                      >
                        <span className={getResponsiveTextSize('sm')}>Clear</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* How it Works */}
                <div className={getResponsiveGap('md')}>
                  <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>How it Works</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className={`${getResponsiveTextSize('sm')} text-muted-foreground mb-3`}>Dual AI Engine Fallback System:</p>
                    <div className={`space-y-2 ${getResponsiveTextSize('sm')}`}>
                      <p>1. The app first tries to use the HuggingFace model for sentiment analysis</p>
                      <p>2. If that fails, it automatically falls back to Google Gemini 2.0 Flash (if configured)</p>
                      <p>3. Gemini 2.0 Flash provides detailed emotion analysis similar to the original model</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ollama" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                {/* Ollama Configuration Section */}
                <div className={getResponsiveGap('md')}>
                  <div className="flex items-center gap-2">
                    <Settings className={`${getResponsiveIconSize('sm')} text-primary`} />
                    <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Ollama Local AI Models</h3>
                  </div>
                  
                  {!ollamaAvailable ? (
                    <Alert className="bg-muted/30 border-border/50">
                      <AlertCircle className={getResponsiveIconSize('sm')} />
                      <AlertDescription className={getResponsiveTextSize('sm')}>
                        Ollama is not running or not installed. Please install and start Ollama to use local AI models.
                        <br />
                        <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Download Ollama
                        </a> • <a href="https://github.com/ollama/ollama" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Documentation
                        </a>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert className="bg-muted/30 border-border/50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ollama is running! Select a model below to use for local sentiment analysis.
                          Local models provide privacy and work offline.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="ollamaModel">Select Model</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select
                              id="ollamaModel"
                              value={selectedOllamaModel}
                              onChange={(e) => setSelectedOllamaModel(e.target.value)}
                              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              disabled={isLoadingOllamaModels}
                            >
                              <option value="">Select a model...</option>
                              {ollamaModels.map((model) => (
                                <option key={model.name} value={model.name}>
                                  {model.name} 
                                  {isRecommendedModel(model.name) && ' ⭐ (Recommended)'}
                                  {model.details?.parameter_size && ` - ${model.details.parameter_size}`}
                                </option>
                              ))}
                            </select>
                            {isLoadingOllamaModels && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Settings className="h-4 w-4" />
                                </motion.div>
                              </div>
                            )}
                          </div>
                          {ollamaModelStatus === 'valid' && (
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                          {ollamaModelStatus === 'invalid' && (
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={saveOllamaModel}
                          disabled={isTestingOllamaModel || !selectedOllamaModel.trim()}
                          className="bg-gradient-sentiment"
                        >
                          {isTestingOllamaModel ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                              >
                                <Save className="h-4 w-4" />
                              </motion.div>
                              Testing...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save & Test
                            </>
                          )}
                        </Button>
                        
                        {selectedOllamaModel && (
                          <Button
                            variant="outline"
                            onClick={clearOllamaModel}
                          >
                            Clear
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={loadOllamaModels}
                          disabled={isLoadingOllamaModels}
                        >
                          Refresh Models
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Ollama Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About Ollama</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-3">Local AI with Privacy:</p>
                    <div className="space-y-1 text-sm">
                      <p>• <strong>Complete Privacy:</strong> All processing happens on your machine</p>
                      <p>• <strong>Offline Capable:</strong> Works without internet connection</p>
                      <p>• <strong>No API Costs:</strong> Free to use once models are downloaded</p>
                      <p>• <strong>High Performance:</strong> Optimized for local hardware</p>
                      <p>• <strong>Multiple Models:</strong> Choose from various AI models</p>
                    </div>
                  </div>
                  
                  {ollamaModels.length > 0 && (
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-2">Available Models ({ollamaModels.length}):</p>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {ollamaModels.slice(0, 5).map((model) => (
                          <div key={model.name} className="flex justify-between">
                            <span>{model.name}</span>
                            <span className="text-muted-foreground">
                              {(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB
                            </span>
                          </div>
                        ))}
                        {ollamaModels.length > 5 && (
                          <p className="text-muted-foreground">...and {ollamaModels.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sentiment" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                {/* Sentiment API Key Section */}
                <div className={getResponsiveGap('md')}>
                  <div className="flex items-center gap-2">
                    <CloudLightning className={`${getResponsiveIconSize('sm')} text-primary`} />
                    <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Sentiment Analysis API Key</h3>
                  </div>
                  
                  <Alert className="bg-muted/30 border-border/50">
                    <AlertCircle className={getResponsiveIconSize('sm')} />
                    <AlertDescription className={getResponsiveTextSize('sm')}>
                      Enter your Sentiment Analysis API key to enable enhanced sentiment analysis capabilities. 
                      This provides an additional analysis method alongside HuggingFace and Gemini models.
                    </AlertDescription>
                  </Alert>

                  <div className={getResponsiveGap('sm')}>
                    <Label htmlFor="sentimentKey" className={getResponsiveTextSize('sm')}>API Key</Label>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${getResponsiveGap('sm')}`}>
                      <div className="relative flex-1">
                        <Input
                          id="sentimentKey"
                          type={showSentimentKey ? "text" : "password"}
                          value={sentimentApiKey}
                          onChange={(e) => setSentimentApiKey(e.target.value)}
                          placeholder="Enter your Sentiment API key..."
                          className={`pr-10 ${getTouchFriendlyClasses()}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent ${getTouchFriendlyClasses()}`}
                          onClick={() => setShowSentimentKey(!showSentimentKey)}
                        >
                          {showSentimentKey ? (
                            <EyeOff className={getResponsiveIconSize('sm')} />
                          ) : (
                            <Eye className={getResponsiveIconSize('sm')} />
                          )}
                        </Button>
                      </div>
                      {sentimentKeyStatus === 'valid' && (
                        <div className="flex items-center">
                          <CheckCircle className={`${getResponsiveIconSize('md')} text-green-500`} />
                        </div>
                      )}
                      {sentimentKeyStatus === 'invalid' && (
                        <div className="flex items-center">
                          <AlertCircle className={`${getResponsiveIconSize('md')} text-destructive`} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={saveSentimentApiKey}
                      disabled={isTestingSentimentKey || !sentimentApiKey.trim()}
                      className={`bg-gradient-sentiment ${getTouchFriendlyClasses()}`}
                    >
                      {isTestingSentimentKey ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Save className={getResponsiveIconSize('sm')} />
                          </motion.div>
                          <span className={getResponsiveTextSize('sm')}>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Save className={`mr-2 ${getResponsiveIconSize('sm')}`} />
                          <span className={getResponsiveTextSize('sm')}>Save & Test</span>
                        </>
                      )}
                    </Button>
                    
                    {sentimentApiKey && (
                      <Button
                        variant="outline"
                        onClick={clearSentimentApiKey}
                        className={getTouchFriendlyClasses()}
                      >
                        <span className={getResponsiveTextSize('sm')}>Clear</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* API Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">API Information</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-3">Multi-Engine Analysis System:</p>
                    <div className="space-y-1 text-sm">
                      <p>1. <strong>Primary:</strong> HuggingFace Transformers (runs locally in browser)</p>
                      <p>2. <strong>Fallback 1:</strong> Google Gemini 2.0 Flash (if configured)</p>
                      <p>3. <strong>Fallback 2:</strong> Sentiment Analysis API (if configured)</p>
                      <p>4. The app automatically selects the best available method for analysis</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className={`${getResponsiveGap('lg')} space-y-4 sm:space-y-6 pb-6`}>
                {/* Data Storage Info */}
                <div className={getResponsiveGap('md')}>
                  <div className="flex items-center gap-2">
                    <Database className={`${getResponsiveIconSize('sm')} text-primary`} />
                    <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Data Storage</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-muted/30 border-border/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{getStorageInfo().itemCount}</div>
                          <div className="text-sm text-muted-foreground">Stored Messages</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-border/50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{getStorageInfo().sizeInKB} KB</div>
                          <div className="text-sm text-muted-foreground">Storage Used</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="bg-muted/30 border-border/50">
                    <AlertCircle className={getResponsiveIconSize('sm')} />
                    <AlertDescription className={getResponsiveTextSize('sm')}>
                      Data is stored locally in your browser. Maximum capacity: {getStorageInfo().maxItems} messages. 
                      Older messages are automatically removed when the limit is reached.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Quick Export */}
                <div className={getResponsiveGap('md')}>
                  <div className="flex items-center gap-2">
                    <Download className={`${getResponsiveIconSize('sm')} text-primary`} />
                    <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Quick Export</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickExport('csv')}
                      disabled={sentiments.length === 0}
                      className={`flex items-center gap-2 ${getTouchFriendlyClasses()}`}
                    >
                      <Download className={getResponsiveIconSize('sm')} />
                      <span className={getResponsiveTextSize('sm')}>Export CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickExport('json')}
                      disabled={sentiments.length === 0}
                      className={`flex items-center gap-2 ${getTouchFriendlyClasses()}`}
                    >
                      <Download className={getResponsiveIconSize('sm')} />
                      <span className={getResponsiveTextSize('sm')}>Export JSON</span>
                    </Button>
                  </div>
                  
                  <p className={`${getResponsiveTextSize('xs')} text-muted-foreground`}>
                    For advanced export options with filters, use the Export button in the main dashboard.
                  </p>
                </div>

                {/* Data Management */}
                <div className={getResponsiveGap('md')}>
                  <div className="flex items-center gap-2">
                    <Trash2 className={`${getResponsiveIconSize('sm')} text-destructive`} />
                    <h3 className={`${getResponsiveTextSize('lg')} font-semibold`}>Data Management</h3>
                  </div>
                  
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className={`${getResponsiveTextSize('sm')} text-muted-foreground mb-3`}>
                      Clear all stored sentiment analysis data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleClearHistory}
                      disabled={sentiments.length === 0}
                      className={`flex items-center gap-2 ${getTouchFriendlyClasses()}`}
                    >
                      <Trash2 className={getResponsiveIconSize('sm')} />
                      <span className={getResponsiveTextSize('sm')}>Clear All Data</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
};
