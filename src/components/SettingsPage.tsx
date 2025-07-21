import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, Database, Trash2, Download, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePersistedSentiments } from '@/hooks/usePersistedSentiments';
import { useDataExport } from '@/hooks/useDataExport';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage = ({ onClose }: SettingsPageProps) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'untested'>('untested');
  const { toast } = useToast();
  
  // Data management hooks
  const { sentiments, clearHistory, getStorageInfo } = usePersistedSentiments();
  const { exportData } = useDataExport();

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
      setKeyStatus('valid'); // Assume it's valid if saved
    }
  }, []);

  const testApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setKeyStatus('invalid');
      return false;
    }

    setIsTestingKey(true);
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
        setKeyStatus('valid');
        return true;
      } else {
        setKeyStatus('invalid');
        return false;
      }
    } catch (error) {
      setKeyStatus('invalid');
      return false;
    } finally {
      setIsTestingKey(false);
    }
  };

  const saveApiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid API key"
      });
      return;
    }

    const isValid = await testApiKey(geminiApiKey);
    
    if (isValid) {
      localStorage.setItem('gemini_api_key', geminiApiKey);
      toast({
        title: "Success",
        description: "API key saved and validated successfully!"
      });
    } else {
      toast({
        variant: "destructive", 
        title: "Invalid API Key",
        description: "The API key you entered is not valid. Please check and try again."
      });
    }
  };

  const clearApiKey = () => {
    setGeminiApiKey('');
    setKeyStatus('untested');
    localStorage.removeItem('gemini_api_key');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed."
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-gradient-card border-border/50 shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="api" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Configuration
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-6">
                {/* API Key Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">Google Gemini API Key</h3>
                  </div>
                  
                  <Alert className="bg-muted/30 border-border/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Enter your Google Gemini API key to enable sentiment analysis with Gemini 2.0 Flash when HuggingFace models are unavailable. 
                      Get your free API key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="geminiKey">API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="geminiKey"
                          type={showApiKey ? "text" : "password"}
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="Enter your Gemini API key..."
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {keyStatus === 'valid' && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {keyStatus === 'invalid' && (
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={saveApiKey}
                      disabled={isTestingKey || !geminiApiKey.trim()}
                      className="bg-gradient-sentiment"
                    >
                      {isTestingKey ? (
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
                    
                    {geminiApiKey && (
                      <Button
                        variant="outline"
                        onClick={clearApiKey}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* How it Works */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">How it Works</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-3">Dual AI Engine Fallback System:</p>
                    <div className="space-y-1 text-sm">
                      <p>1. The app first tries to use the HuggingFace model for sentiment analysis</p>
                      <p>2. If that fails, it automatically falls back to Google Gemini 2.0 Flash (if configured)</p>
                      <p>3. Gemini 2.0 Flash provides detailed emotion analysis similar to the original model</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                {/* Data Storage Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">Data Storage</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Data is stored locally in your browser. Maximum capacity: {getStorageInfo().maxItems} messages. 
                      Older messages are automatically removed when the limit is reached.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Quick Export */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">Quick Export</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickExport('csv')}
                      disabled={sentiments.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickExport('json')}
                      disabled={sentiments.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export JSON
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    For advanced export options with filters, use the Export button in the main dashboard.
                  </p>
                </div>

                {/* Data Management */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <h3 className="text-lg font-semibold">Data Management</h3>
                  </div>
                  
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm text-muted-foreground mb-3">
                      Clear all stored sentiment analysis data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleClearHistory}
                      disabled={sentiments.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};