import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAdaptiveExamples } from '@/hooks/useAdaptiveExamples';
import { FeatureHighlight } from '@/components/FeatureHighlight';

interface SentimentFormProps {
  onAnalyze: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>;
  isAnalyzing: boolean;
  result?: SentimentResult | null;
  getEmotionColor: (emotion: string) => string;
  sentimentHistory: SentimentResult[];
}

export const SentimentForm = ({ onAnalyze, isAnalyzing, result, getEmotionColor, sentimentHistory }: SentimentFormProps) => {
  const { settings, saveFormData } = useUserSettings();
  const { examples, userPattern, updateExampleUsage, lastUpdate } = useAdaptiveExamples(sentimentHistory);
  
  const [message, setMessage] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [channel, setChannel] = useState('');

  // Load saved form data on component mount
  useEffect(() => {
    if (settings.form.rememberFormData) {
      setMessage(settings.form.lastMessage);
      setCustomerId(settings.form.lastCustomerId);
      setChannel(settings.form.lastChannel);
    }
  }, [settings.form.rememberFormData, settings.form.lastMessage, settings.form.lastCustomerId, settings.form.lastChannel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Save form data if remember option is enabled
    if (settings.form.rememberFormData) {
      saveFormData(customerId, channel, message);
    }
    
    await onAnalyze(message, customerId || undefined, channel || undefined);
  };

  const setExampleMessage = (exampleText: string, exampleId: string) => {
    setMessage(exampleText);
    updateExampleUsage(exampleId);
    
    // Auto-analyze if enabled
    if (settings.analysis.autoAnalyzeOnPaste) {
      // Small delay to allow state update
      setTimeout(() => {
        if (exampleText.trim()) {
          onAnalyze(exampleText, customerId || undefined, channel || undefined);
        }
      }, 100);
    }
  };

  // Handle paste events for auto-analysis
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (settings.analysis.autoAnalyzeOnPaste) {
      const pastedText = e.clipboardData.getData('text');
      if (pastedText.trim()) {
        // Small delay to allow the paste to complete
        setTimeout(() => {
          onAnalyze(pastedText, customerId || undefined, channel || undefined);
        }, 100);
      }
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card sentiment-form">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-primary">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Customer Message Analysis</span>
          <span className="sm:hidden">Message Analysis</span>
        </CardTitle>
        {settings.form.rememberFormData && (
          <FeatureHighlight
            feature="form-memory"
            title="Smart Form Memory"
            description="Your form data is now being remembered! Customer ID, channel, and messages are automatically restored."
            position="bottom"
            delay={1500}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId" className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Customer ID (Optional)
              </Label>
              <Input
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g., CUST_001"
                className="bg-background/50 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-sm">Channel (Optional)</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="bg-background/50 text-sm">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="chat">💬 Live Chat</SelectItem>
                  <SelectItem value="phone">📞 Phone</SelectItem>
                  <SelectItem value="social">📱 Social Media</SelectItem>
                  <SelectItem value="review">⭐ Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm">Customer Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder="Type or paste the customer message here..."
              className="min-h-[100px] sm:min-h-[120px] bg-background/50 resize-none text-sm"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={!message.trim() || isAnalyzing}
            className="w-full bg-gradient-sentiment hover:shadow-glow transition-all duration-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Analyze Sentiment
              </>
            )}
          </Button>
        </form>

        {/* Adaptive Example Messages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {userPattern ? 'Personalized examples for you:' : 'Try these real customer scenarios:'}
            </Label>
            {userPattern && (
              <Badge variant="secondary" className="text-xs">
                🧠 AI Adapted
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {examples.map((example) => (
              <motion.button
                key={example.id}
                onClick={() => setExampleMessage(example.text, example.id)}
                className="text-left p-2 sm:p-3 text-xs sm:text-sm bg-muted/50 rounded-md hover:bg-muted transition-colors border border-border/50 line-clamp-3 relative group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs text-muted-foreground capitalize">
                    {example.channel && `📱 ${example.channel}`} • {example.category}
                  </span>
                  {example.useCount > 0 && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {example.useCount}x
                    </Badge>
                  )}
                </div>
                "{example.text}"
                
                {/* Hover tooltip showing why this example was selected */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 bg-popover text-popover-foreground p-2 rounded-md shadow-md border text-xs max-w-xs">
                  <div className="font-medium mb-1">Why this example?</div>
                  <div className="space-y-1">
                    {userPattern?.preferredChannels.includes(example.channel || '') && (
                      <div>• Matches your preferred channel: {example.channel}</div>
                    )}
                    {userPattern?.commonEmotions.includes(example.emotion) && (
                      <div>• Common emotion in your analysis: {example.emotion}</div>
                    )}
                    <div>• Effectiveness: {Math.round(example.effectiveness * 100)}%</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
            {userPattern ? (
              <>
                🧠 <strong>Smart Examples:</strong> These examples are personalized based on your usage patterns. 
                Preferred channels: {userPattern.preferredChannels.join(', ')} • 
                Common emotions: {userPattern.commonEmotions.join(', ')} • 
                Last updated: {lastUpdate.toLocaleTimeString()}
              </>
            ) : (
              <>
                💡 <strong>Tip:</strong> These examples represent common customer service scenarios. 
                As you use the tool, examples will adapt to your specific needs and usage patterns.
              </>
            )}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Analysis Result</h3>
              <Badge 
                variant="secondary" 
                className={`bg-${getEmotionColor(result.emotion)} text-white border-0`}
              >
                {result.emotion.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              {settings.analysis.showDetailedResults && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analysis Provider:</span>
                    <span className="font-medium capitalize">{result.provider || 'Auto'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Time:</span>
                    <span className="font-medium">{result.processingTime || 'N/A'}ms</span>
                  </div>
                </>
              )}
              {result.customerId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer ID:</span>
                  <span className="font-medium">{result.customerId}</span>
                </div>
              )}
              {result.channel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel:</span>
                  <span className="font-medium capitalize">{result.channel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analyzed:</span>
                <span className="font-medium">{result.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};