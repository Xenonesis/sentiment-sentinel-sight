import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

interface SentimentTrendsChartProps {
  sentiments: SentimentResult[];
  getEmotionColor: (emotion: string) => string;
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

const isNegativeEmotion = (emotion: string): boolean => {
  const negativeEmotions = ['anger', 'disgust', 'fear', 'sadness', 'negative'];
  return negativeEmotions.some(neg => emotion.toLowerCase().includes(neg));
};

const isPositiveEmotion = (emotion: string): boolean => {
  const positiveEmotions = ['joy', 'happiness', 'love', 'surprise', 'positive'];
  return positiveEmotions.some(pos => emotion.toLowerCase().includes(pos));
};

export const SentimentTrendsChart = ({ sentiments, getEmotionColor }: SentimentTrendsChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const chartData = useMemo(() => {
    if (sentiments.length === 0) return [];

    // Filter sentiments by time range
    const now = new Date();
    let filteredSentiments = sentiments;

    switch (timeRange) {
      case '24h':
        filteredSentiments = sentiments.filter(s => 
          isWithinInterval(s.timestamp, { start: subDays(now, 1), end: now })
        );
        break;
      case '7d':
        filteredSentiments = sentiments.filter(s => 
          isWithinInterval(s.timestamp, { start: subDays(now, 7), end: now })
        );
        break;
      case '30d':
        filteredSentiments = sentiments.filter(s => 
          isWithinInterval(s.timestamp, { start: subDays(now, 30), end: now })
        );
        break;
      case 'all':
      default:
        filteredSentiments = sentiments;
        break;
    }

    // Group by time intervals
    const timeFormat = timeRange === '24h' ? 'HH:mm' : 'MMM dd';
    const groupedData = filteredSentiments.reduce((acc, sentiment) => {
      const timeKey = format(sentiment.timestamp, timeFormat);
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          positive: 0,
          negative: 0,
          neutral: 0,
          total: 0,
          timestamp: sentiment.timestamp
        };
      }

      acc[timeKey].total++;
      
      if (isPositiveEmotion(sentiment.emotion)) {
        acc[timeKey].positive++;
      } else if (isNegativeEmotion(sentiment.emotion)) {
        acc[timeKey].negative++;
      } else {
        acc[timeKey].neutral++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by timestamp
    return Object.values(groupedData)
      .sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((item: any) => ({
        time: item.time,
        positive: item.positive,
        negative: item.negative,
        neutral: item.neutral,
        total: item.total,
        positivePercent: Math.round((item.positive / item.total) * 100),
        negativePercent: Math.round((item.negative / item.total) * 100),
        neutralPercent: Math.round((item.neutral / item.total) * 100)
      }));
  }, [sentiments, timeRange]);

  const trendStats = useMemo(() => {
    if (chartData.length < 2) return null;

    const recent = chartData.slice(-3); // Last 3 data points
    const earlier = chartData.slice(0, 3); // First 3 data points

    const recentAvgPositive = recent.reduce((sum, item) => sum + item.positivePercent, 0) / recent.length;
    const earlierAvgPositive = earlier.reduce((sum, item) => sum + item.positivePercent, 0) / earlier.length;

    const trend = recentAvgPositive - earlierAvgPositive;
    const isImproving = trend > 5; // More than 5% improvement
    const isWorsening = trend < -5; // More than 5% decline

    return {
      trend,
      isImproving,
      isWorsening,
      recentAvgPositive: Math.round(recentAvgPositive),
      earlierAvgPositive: Math.round(earlierAvgPositive)
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Positive: {data.positive} ({data.positivePercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Negative: {data.negative} ({data.negativePercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Neutral: {data.neutral} ({data.neutralPercent}%)</span>
            </div>
            <div className="border-t border-border pt-1 mt-2">
              <span className="text-sm font-medium">Total: {data.total} messages</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (sentiments.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Sentiment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available yet</p>
            <p className="text-sm">Analyze some messages to see trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sentiment Trends
            </CardTitle>
            <div className="flex items-center gap-3">
              {trendStats && (
                <div className="flex items-center gap-2">
                  {trendStats.isImproving && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Improving
                    </Badge>
                  )}
                  {trendStats.isWorsening && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-300">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Declining
                    </Badge>
                  )}
                </div>
              )}
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="positive" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name="Positive"
                />
                <Line 
                  type="monotone" 
                  dataKey="negative" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  name="Negative"
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#6b7280', strokeWidth: 2 }}
                  name="Neutral"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {trendStats && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trend Analysis:</span>
                <span className="font-medium">
                  {trendStats.isImproving && "📈 Sentiment improving"}
                  {trendStats.isWorsening && "📉 Sentiment declining"}
                  {!trendStats.isImproving && !trendStats.isWorsening && "➡️ Sentiment stable"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Recent avg: {trendStats.recentAvgPositive}% positive vs Earlier avg: {trendStats.earlierAvgPositive}% positive
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};