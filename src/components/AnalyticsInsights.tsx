import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

interface AnalyticsInsightsProps {
  sentiments: SentimentResult[];
  isNegativeEmotion: (emotion: string) => boolean;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  metric?: string;
  recommendation?: string;
}

export const AnalyticsInsights = ({ sentiments, isNegativeEmotion }: AnalyticsInsightsProps) => {
  const insights = useMemo((): Insight[] => {
    if (sentiments.length === 0) return [];

    const insights: Insight[] = [];
    
    // Calculate basic metrics
    const totalMessages = sentiments.length;
    const negativeCount = sentiments.filter(s => isNegativeEmotion(s.emotion)).length;
    const positiveCount = totalMessages - negativeCount;
    const negativePercentage = (negativeCount / totalMessages) * 100;
    const averageConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / totalMessages;

    // Recent trend analysis (last 10 vs previous 10)
    const recentMessages = sentiments.slice(-10);
    const previousMessages = sentiments.slice(-20, -10);
    const recentNegative = recentMessages.filter(s => isNegativeEmotion(s.emotion)).length / recentMessages.length;
    const previousNegative = previousMessages.length > 0 ? 
      previousMessages.filter(s => isNegativeEmotion(s.emotion)).length / previousMessages.length : 0;

    // Channel analysis
    const channelData = sentiments.reduce((acc, s) => {
      const channel = s.channel || 'unknown';
      if (!acc[channel]) acc[channel] = { total: 0, negative: 0 };
      acc[channel].total++;
      if (isNegativeEmotion(s.emotion)) acc[channel].negative++;
      return acc;
    }, {} as Record<string, { total: number; negative: number }>);

    // Customer analysis
    const customerData = sentiments.reduce((acc, s) => {
      if (s.customerId) {
        if (!acc[s.customerId]) acc[s.customerId] = { total: 0, negative: 0 };
        acc[s.customerId].total++;
        if (isNegativeEmotion(s.emotion)) acc[s.customerId].negative++;
      }
      return acc;
    }, {} as Record<string, { total: number; negative: number }>);

    // Generate insights

    // 1. Overall sentiment health
    if (negativePercentage < 20) {
      insights.push({
        type: 'positive',
        title: 'Excellent Sentiment Health',
        description: `Only ${negativePercentage.toFixed(1)}% of messages show negative sentiment.`,
        metric: `${positiveCount}/${totalMessages} positive`,
        recommendation: 'Continue current practices to maintain high customer satisfaction.'
      });
    } else if (negativePercentage > 40) {
      insights.push({
        type: 'negative',
        title: 'High Negative Sentiment Detected',
        description: `${negativePercentage.toFixed(1)}% of messages show negative sentiment.`,
        metric: `${negativeCount}/${totalMessages} negative`,
        recommendation: 'Immediate attention required. Review recent customer interactions and address common issues.'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Moderate Negative Sentiment',
        description: `${negativePercentage.toFixed(1)}% of messages show negative sentiment.`,
        metric: `${negativeCount}/${totalMessages} negative`,
        recommendation: 'Monitor closely and consider proactive customer outreach.'
      });
    }

    // 2. Trend analysis
    if (recentMessages.length >= 5 && previousMessages.length >= 5) {
      const trendChange = ((recentNegative - previousNegative) * 100);
      if (Math.abs(trendChange) > 10) {
        insights.push({
          type: trendChange > 0 ? 'negative' : 'positive',
          title: trendChange > 0 ? 'Worsening Sentiment Trend' : 'Improving Sentiment Trend',
          description: `Recent messages show ${Math.abs(trendChange).toFixed(1)}% ${trendChange > 0 ? 'increase' : 'decrease'} in negative sentiment.`,
          recommendation: trendChange > 0 ? 
            'Investigate recent changes that might be affecting customer satisfaction.' :
            'Great progress! Continue current improvement strategies.'
        });
      }
    }

    // 3. Confidence analysis
    if (averageConfidence < 0.7) {
      insights.push({
        type: 'warning',
        title: 'Low Analysis Confidence',
        description: `Average confidence is ${(averageConfidence * 100).toFixed(1)}%.`,
        recommendation: 'Consider reviewing message quality or AI model configuration for better accuracy.'
      });
    }

    // 4. Channel-specific insights
    const problematicChannels = Object.entries(channelData)
      .filter(([_, data]) => data.total >= 3 && (data.negative / data.total) > 0.5)
      .sort((a, b) => (b[1].negative / b[1].total) - (a[1].negative / a[1].total));

    if (problematicChannels.length > 0) {
      const [channel, data] = problematicChannels[0];
      insights.push({
        type: 'negative',
        title: `${channel.charAt(0).toUpperCase() + channel.slice(1)} Channel Issues`,
        description: `${((data.negative / data.total) * 100).toFixed(1)}% negative sentiment in ${channel} channel.`,
        metric: `${data.negative}/${data.total} messages`,
        recommendation: `Focus on improving ${channel} channel experience and support quality.`
      });
    }

    // 5. Customer-specific insights
    const riskCustomers = Object.entries(customerData)
      .filter(([_, data]) => data.total >= 2 && (data.negative / data.total) >= 0.5)
      .length;

    if (riskCustomers > 0) {
      insights.push({
        type: 'warning',
        title: 'At-Risk Customers Identified',
        description: `${riskCustomers} customers showing consistently negative sentiment.`,
        recommendation: 'Prioritize outreach to these customers to address their concerns and prevent churn.'
      });
    }

    // 6. Volume insights
    if (totalMessages > 50) {
      insights.push({
        type: 'neutral',
        title: 'High Message Volume',
        description: `Analyzed ${totalMessages} messages with comprehensive data coverage.`,
        recommendation: 'Consider implementing automated sentiment monitoring for real-time alerts.'
      });
    }

    return insights.slice(0, 6); // Limit to top 6 insights
  }, [sentiments, isNegativeEmotion]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'negative':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50';
      case 'negative':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm">Analyze more messages to generate AI-powered insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  
                  {insight.metric && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      {insight.metric}
                    </Badge>
                  )}
                  
                  {insight.recommendation && (
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};