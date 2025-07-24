/**
 * Demo component to showcase adaptive examples functionality
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdaptiveExamples } from '@/hooks/useAdaptiveExamples';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

// Mock sentiment history for demo
const mockSentimentHistory: SentimentResult[] = [
  {
    emotion: 'anger',
    confidence: 0.95,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    message: "This is the third time I'm calling about the same issue!",
    channel: 'phone',
    customerId: 'CUST_001'
  },
  {
    emotion: 'joy',
    confidence: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    message: "Thank you for the excellent customer service!",
    channel: 'email',
    customerId: 'CUST_002'
  },
  {
    emotion: 'fear',
    confidence: 0.92,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    message: "I noticed unauthorized charges on my account",
    channel: 'chat',
    customerId: 'CUST_003'
  },
  {
    emotion: 'anger',
    confidence: 0.85,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    message: "Your app is constantly crashing and I'm losing work",
    channel: 'social',
    customerId: 'CUST_004'
  },
  {
    emotion: 'neutral',
    confidence: 0.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    message: "Can you help me understand the new pricing structure?",
    channel: 'email',
    customerId: 'CUST_005'
  }
];

export const AdaptiveExamplesDemo: React.FC = () => {
  const [demoHistory, setDemoHistory] = useState<SentimentResult[]>([]);
  const { examples, userPattern, updateExampleUsage, lastUpdate } = useAdaptiveExamples(demoHistory);

  const addMockHistory = () => {
    setDemoHistory(mockSentimentHistory);
  };

  const clearHistory = () => {
    setDemoHistory([]);
  };

  const simulateUsage = (exampleId: string) => {
    updateExampleUsage(exampleId);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Adaptive Examples Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addMockHistory} variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Load Sample History
            </Button>
            <Button onClick={clearHistory} variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>

          {userPattern && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Preferred Channels</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userPattern.preferredChannels.map(channel => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Common Emotions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userPattern.commonEmotions.map(emotion => (
                      <Badge key={emotion} variant="secondary" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Context</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>Time: {userPattern.timeOfDay}</div>
                    <div>Urgency: {userPattern.urgencyLevel}</div>
                    <div>Frequency: {userPattern.analysisFrequency}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Adaptive Examples</span>
            {userPattern && (
              <Badge variant="secondary" className="text-xs">
                🧠 AI Adapted
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {examples.map((example) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-muted/50 rounded-md border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {example.channel} • {example.category}
                    </Badge>
                    <Badge variant="secondary" className={`text-xs bg-sentiment-${example.emotion}`}>
                      {example.emotion}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {example.useCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {example.useCount}x used
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => simulateUsage(example.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Use
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  "{example.text}"
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Priority: {example.priority}/10</span>
                  <span>Effectiveness: {Math.round(example.effectiveness * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </div>

          {!userPattern && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No usage patterns detected yet.</p>
              <p className="text-xs">Load sample history to see adaptive examples in action.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {userPattern && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <div><strong>Analysis Frequency:</strong> {userPattern.analysisFrequency} messages analyzed</div>
              <div><strong>Time Context:</strong> {userPattern.timeOfDay}</div>
              <div><strong>Urgency Level:</strong> {userPattern.urgencyLevel}</div>
              <div><strong>Last Updated:</strong> {lastUpdate.toLocaleString()}</div>
              <div><strong>Total Examples Available:</strong> {examples.length}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};