import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  format, subDays, startOfDay, endOfDay, isWithinInterval, 
  differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth
} from 'date-fns';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  Activity, Users, MessageSquare, Clock, Target, AlertTriangle,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';
import { AnalyticsInsights } from './AnalyticsInsights';

interface AdvancedAnalyticsDashboardProps {
  sentiments: SentimentResult[];
  getEmotionColor: (emotion: string) => string;
  isNegativeEmotion: (emotion: string) => boolean;
}

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
type ChartType = 'overview' | 'trends' | 'distribution' | 'performance';

interface AnalyticsMetrics {
  totalMessages: number;
  averageConfidence: number;
  sentimentScore: number; // -100 to +100
  responseTime: number; // simulated
  customerSatisfaction: number; // 0-100
  trendDirection: 'up' | 'down' | 'stable';
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  channelBreakdown: Array<{ channel: string; count: number; avgSentiment: number }>;
  timePatterns: Array<{ hour: number; count: number; avgSentiment: number }>;
  customerInsights: {
    totalCustomers: number;
    returningCustomers: number;
    newCustomers: number;
    riskCustomers: number;
  };
}

const EMOTION_COLORS = {
  joy: '#10B981',
  happiness: '#10B981', 
  positive: '#10B981',
  love: '#EC4899',
  optimism: '#F59E0B',
  surprise: '#8B5CF6',
  neutral: '#6B7280',
  sadness: '#3B82F6',
  fear: '#EF4444',
  anger: '#DC2626',
  disgust: '#7C2D12',
  negative: '#DC2626'
};

export const AdvancedAnalyticsDashboard = ({ 
  sentiments, 
  getEmotionColor, 
  isNegativeEmotion 
}: AdvancedAnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeTab, setActiveTab] = useState<ChartType>('overview');

  // Filter sentiments by time range
  const filteredSentiments = useMemo(() => {
    if (timeRange === 'all') return sentiments;
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      default:
        return sentiments;
    }
    
    return sentiments.filter(sentiment => 
      isWithinInterval(sentiment.timestamp, {
        start: startOfDay(startDate),
        end: endOfDay(now)
      })
    );
  }, [sentiments, timeRange]);

  // Calculate comprehensive analytics metrics
  const analytics = useMemo((): AnalyticsMetrics => {
    if (filteredSentiments.length === 0) {
      return {
        totalMessages: 0,
        averageConfidence: 0,
        sentimentScore: 0,
        responseTime: 0,
        customerSatisfaction: 0,
        trendDirection: 'stable',
        topEmotions: [],
        channelBreakdown: [],
        timePatterns: [],
        customerInsights: {
          totalCustomers: 0,
          returningCustomers: 0,
          newCustomers: 0,
          riskCustomers: 0
        }
      };
    }

    // Basic metrics
    const totalMessages = filteredSentiments.length;
    const averageConfidence = filteredSentiments.reduce((sum, s) => sum + s.confidence, 0) / totalMessages;

    // Sentiment score calculation (-100 to +100)
    const positiveCount = filteredSentiments.filter(s => !isNegativeEmotion(s.emotion)).length;
    const negativeCount = filteredSentiments.filter(s => isNegativeEmotion(s.emotion)).length;
    const sentimentScore = ((positiveCount - negativeCount) / totalMessages) * 100;

    // Customer satisfaction (0-100, based on sentiment score and confidence)
    const customerSatisfaction = Math.max(0, Math.min(100, 50 + (sentimentScore * 0.5)));

    // Emotion distribution
    const emotionCounts = filteredSentiments.reduce((acc, sentiment) => {
      acc[sentiment.emotion] = (acc[sentiment.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: (count / totalMessages) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Channel breakdown
    const channelData = filteredSentiments.reduce((acc, sentiment) => {
      const channel = sentiment.channel || 'unknown';
      if (!acc[channel]) {
        acc[channel] = { messages: [], count: 0 };
      }
      acc[channel].messages.push(sentiment);
      acc[channel].count++;
      return acc;
    }, {} as Record<string, { messages: SentimentResult[]; count: number }>);

    const channelBreakdown = Object.entries(channelData).map(([channel, data]) => {
      const positives = data.messages.filter(s => !isNegativeEmotion(s.emotion)).length;
      const avgSentiment = ((positives - (data.count - positives)) / data.count) * 100;
      return { channel, count: data.count, avgSentiment };
    });

    // Time patterns (hourly analysis)
    const timePatterns = Array.from({ length: 24 }, (_, hour) => {
      const hourMessages = filteredSentiments.filter(s => s.timestamp.getHours() === hour);
      const count = hourMessages.length;
      const positives = hourMessages.filter(s => !isNegativeEmotion(s.emotion)).length;
      const avgSentiment = count > 0 ? ((positives - (count - positives)) / count) * 100 : 0;
      return { hour, count, avgSentiment };
    });

    // Customer insights
    const customerIds = new Set(filteredSentiments.map(s => s.customerId).filter(Boolean));
    const totalCustomers = customerIds.size;
    
    // Simulate customer metrics (in real app, this would come from actual data)
    const returningCustomers = Math.floor(totalCustomers * 0.3);
    const newCustomers = totalCustomers - returningCustomers;
    const riskCustomers = filteredSentiments
      .filter(s => s.customerId && isNegativeEmotion(s.emotion) && s.confidence > 0.7)
      .map(s => s.customerId)
      .filter((id, index, arr) => arr.indexOf(id) === index).length;

    // Trend direction (compare with previous period)
    const midPoint = Math.floor(filteredSentiments.length / 2);
    const firstHalf = filteredSentiments.slice(0, midPoint);
    const secondHalf = filteredSentiments.slice(midPoint);
    
    const firstHalfScore = firstHalf.length > 0 ? 
      ((firstHalf.filter(s => !isNegativeEmotion(s.emotion)).length - 
        firstHalf.filter(s => isNegativeEmotion(s.emotion)).length) / firstHalf.length) * 100 : 0;
    const secondHalfScore = secondHalf.length > 0 ?
      ((secondHalf.filter(s => !isNegativeEmotion(s.emotion)).length - 
        secondHalf.filter(s => isNegativeEmotion(s.emotion)).length) / secondHalf.length) * 100 : 0;
    
    const trendDirection: 'up' | 'down' | 'stable' = 
      Math.abs(secondHalfScore - firstHalfScore) < 5 ? 'stable' :
      secondHalfScore > firstHalfScore ? 'up' : 'down';

    return {
      totalMessages,
      averageConfidence,
      sentimentScore,
      responseTime: Math.random() * 24 + 1, // Simulated
      customerSatisfaction,
      trendDirection,
      topEmotions,
      channelBreakdown,
      timePatterns,
      customerInsights: {
        totalCustomers,
        returningCustomers,
        newCustomers,
        riskCustomers
      }
    };
  }, [filteredSentiments, isNegativeEmotion]);

  // Prepare chart data
  const emotionChartData = analytics.topEmotions.map(item => ({
    name: item.emotion,
    value: item.count,
    percentage: item.percentage,
    fill: EMOTION_COLORS[item.emotion.toLowerCase() as keyof typeof EMOTION_COLORS] || '#6B7280'
  }));

  const channelChartData = analytics.channelBreakdown.map(item => ({
    name: item.channel,
    messages: item.count,
    sentiment: item.avgSentiment,
    fill: item.avgSentiment > 0 ? '#10B981' : '#EF4444'
  }));

  const timePatternData = analytics.timePatterns.map(item => ({
    hour: `${item.hour}:00`,
    messages: item.count,
    sentiment: item.avgSentiment
  }));

  // Daily trend data
  const dailyTrendData = useMemo(() => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayMessages = filteredSentiments.filter(s => 
        isWithinInterval(s.timestamp, { start: dayStart, end: dayEnd })
      );
      
      const positive = dayMessages.filter(s => !isNegativeEmotion(s.emotion)).length;
      const negative = dayMessages.filter(s => isNegativeEmotion(s.emotion)).length;
      const sentimentScore = dayMessages.length > 0 ? 
        ((positive - negative) / dayMessages.length) * 100 : 0;
      
      data.push({
        date: format(date, timeRange === '24h' ? 'HH:mm' : 'MMM dd'),
        messages: dayMessages.length,
        positive,
        negative,
        sentiment: sentimentScore,
        confidence: dayMessages.length > 0 ? 
          dayMessages.reduce((sum, s) => sum + s.confidence, 0) / dayMessages.length * 100 : 0
      });
    }
    
    return data;
  }, [filteredSentiments, timeRange, isNegativeEmotion]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'stable';
    format?: 'number' | 'percentage' | 'decimal';
  }) => (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {format === 'percentage' ? `${value.toFixed(1)}%` :
               format === 'decimal' ? value.toFixed(2) :
               Math.round(value).toLocaleString()}
            </p>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(change).toFixed(1)}% vs previous period
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into customer sentiment patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Messages"
          value={analytics.totalMessages}
          icon={MessageSquare}
          trend={analytics.trendDirection}
        />
        <MetricCard
          title="Sentiment Score"
          value={analytics.sentimentScore}
          icon={Target}
          trend={analytics.trendDirection}
          format="decimal"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={analytics.customerSatisfaction}
          icon={Users}
          trend={analytics.trendDirection}
          format="percentage"
        />
        <MetricCard
          title="Average Confidence"
          value={analytics.averageConfidence * 100}
          icon={Activity}
          trend="stable"
          format="percentage"
        />
      </div>

      {/* Alert for concerning trends */}
      {analytics.sentimentScore < -20 && analytics.totalMessages > 10 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Attention Required:</strong> Sentiment score is significantly negative ({analytics.sentimentScore.toFixed(1)}). 
            Consider reviewing recent customer interactions and addressing potential issues.
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChartType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Emotion Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Emotion Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    >
                      {emotionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Channel Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{analytics.customerInsights.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics.customerInsights.newCustomers}</p>
                  <p className="text-sm text-muted-foreground">New Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{analytics.customerInsights.returningCustomers}</p>
                  <p className="text-sm text-muted-foreground">Returning Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analytics.customerInsights.riskCustomers}</p>
                  <p className="text-sm text-muted-foreground">At-Risk Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Daily Sentiment Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sentiment Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Message Volume Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Message Volume & Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="messages" fill="#8884d8" name="Messages" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#82ca9d" 
                    name="Avg Confidence %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          {/* Time Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hourly Activity Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timePatternData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Positive vs Negative Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Positive vs Negative Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" />
                  <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Confidence</span>
                    <span>{(analytics.averageConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.averageConfidence * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Satisfaction Score</span>
                    <span>{analytics.customerSatisfaction.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.customerSatisfaction} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Overall Score</span>
                    <span>{analytics.sentimentScore.toFixed(1)}</span>
                  </div>
                  <Progress 
                    value={Math.max(0, (analytics.sentimentScore + 100) / 2)} 
                    className={analytics.sentimentScore < -20 ? "bg-red-100" : ""}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Emotions Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Top Emotions Detailed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topEmotions.map((emotion, index) => (
                  <div key={emotion.emotion} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary"
                        className={`bg-${getEmotionColor(emotion.emotion)} text-white`}
                      >
                        #{index + 1}
                      </Badge>
                      <span className="font-medium capitalize">{emotion.emotion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {emotion.count} messages
                      </span>
                      <div className="w-20">
                        <Progress value={emotion.percentage} />
                      </div>
                      <span className="text-sm font-medium w-12">
                        {emotion.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered Insights */}
          <AnalyticsInsights 
            sentiments={filteredSentiments}
            isNegativeEmotion={isNegativeEmotion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};