import { useState } from 'react';
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

interface SentimentFormProps {
  onAnalyze: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>;
  isAnalyzing: boolean;
  result?: SentimentResult | null;
  getEmotionColor: (emotion: string) => string;
}

export const SentimentForm = ({ onAnalyze, isAnalyzing, result, getEmotionColor }: SentimentFormProps) => {
  const [message, setMessage] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [channel, setChannel] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await onAnalyze(message, customerId || undefined, channel || undefined);
  };

  const exampleMessages = [
    "I love this product! It's amazing and works perfectly!",
    "This service is terrible and I'm very frustrated with the experience",
    "The support team was helpful but the product needs improvement", 
    "Thank you so much for your quick response and excellent service!"
  ];

  const setExampleMessage = (exampleMessage: string) => {
    setMessage(exampleMessage);
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-primary">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Customer Message Analysis</span>
          <span className="sm:hidden">Message Analysis</span>
        </CardTitle>
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

        {/* Example Messages */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Try these examples:</Label>
          <div className="grid grid-cols-1 gap-2">
            {exampleMessages.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => setExampleMessage(example)}
                className="text-left p-2 sm:p-3 text-xs sm:text-sm bg-muted/50 rounded-md hover:bg-muted transition-colors border border-border/50 line-clamp-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                "{example}"
              </motion.button>
            ))}
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