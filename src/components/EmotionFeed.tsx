import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

interface EmotionFeedProps {
  sentiments: SentimentResult[];
  getEmotionColor: (emotion: string) => string;
  isNegativeEmotion: (emotion: string) => boolean;
}

export const EmotionFeed = ({ sentiments, getEmotionColor, isNegativeEmotion }: EmotionFeedProps) => {
  // Calculate negative sentiment percentage for recent messages (last 10)
  const recentSentiments = sentiments.slice(-10);
  const negativeCount = recentSentiments.filter(s => isNegativeEmotion(s.emotion)).length;
  const negativePercentage = recentSentiments.length > 0 ? (negativeCount / recentSentiments.length) * 100 : 0;
  const showAlert = negativePercentage >= 30 && recentSentiments.length >= 3;

  // Get emotion distribution
  const emotionCounts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment.emotion] = (acc[sentiment.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEmotion = Object.entries(emotionCounts).reduce((a, b) => 
    emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b, ['neutral', 0]
  )[0];

  return (
    <div className="space-y-6">
      {/* Alert for High Negative Sentiment */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="bg-gradient-alert border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground font-medium">
                High negative sentiment detected! {negativePercentage.toFixed(1)}% of recent messages show negative emotions.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-primary">{sentiments.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negative Sentiment</p>
                <p className="text-2xl font-bold text-destructive">{negativePercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Emotion</p>
                <p className="text-lg font-bold capitalize">{topEmotion}</p>
              </div>
              <Badge 
                variant="secondary" 
                className={`bg-${getEmotionColor(topEmotion)} text-white border-0`}
              >
                {emotionCounts[topEmotion] || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Live Emotion Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              <AnimatePresence>
                {sentiments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages analyzed yet.</p>
                    <p className="text-sm">Start by analyzing a customer message above.</p>
                  </div>
                ) : (
                  sentiments.slice().reverse().map((sentiment, index) => (
                    <motion.div
                      key={`${sentiment.timestamp.getTime()}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`bg-${getEmotionColor(sentiment.emotion)} text-white border-0`}
                          >
                            {sentiment.emotion.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">
                            {(sentiment.confidence * 100).toFixed(1)}%
                          </span>
                          {isNegativeEmotion(sentiment.emotion) && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(sentiment.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2 line-clamp-2">"{sentiment.message}"</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {sentiment.customerId && (
                          <span>Customer: {sentiment.customerId}</span>
                        )}
                        {sentiment.channel && (
                          <span>Channel: {sentiment.channel}</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};