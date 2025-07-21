import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage = ({ onClose }: SettingsPageProps) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'untested'>('untested');
  const { toast } = useToast();

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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-card border-border/50 shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      onChange={(e) => {
                        setGeminiApiKey(e.target.value);
                        setKeyStatus('untested');
                      }}
                      placeholder="Enter your Gemini API key..."
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center">
                    {keyStatus === 'valid' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {keyStatus === 'invalid' && <AlertCircle className="h-5 w-5 text-destructive" />}
                    {keyStatus === 'untested' && geminiApiKey && <div className="h-5 w-5 rounded-full bg-yellow-500" />}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveApiKey}
                  disabled={!geminiApiKey.trim() || isTestingKey}
                  className="bg-gradient-sentiment"
                >
                  {isTestingKey ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save & Test
                    </>
                  )}
                </Button>
                {geminiApiKey && (
                  <Button variant="outline" onClick={clearApiKey}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="font-semibold">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HuggingFace Model:</span>
                  <span className="text-primary">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gemini 2.0 Flash:</span>
                  <span className={keyStatus === 'valid' ? 'text-green-500' : 'text-muted-foreground'}>
                    {keyStatus === 'valid' ? 'Configured' : 'Not configured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="font-semibold">How it works</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. The app first tries to use the HuggingFace model for sentiment analysis</p>
                <p>2. If that fails, it automatically falls back to Google Gemini 2.0 Flash (if configured)</p>
                <p>3. Gemini 2.0 Flash provides detailed emotion analysis similar to the original model</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};