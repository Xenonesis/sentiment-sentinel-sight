/**
 * Adaptive Examples Hook
 * Dynamically updates example messages based on user behavior and analysis history
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SentimentResult } from './useSentimentAnalysis';
import { logger } from '@/utils/logger';

interface ExampleMessage {
  id: string;
  text: string;
  category: string;
  emotion: string;
  channel?: string;
  priority: number;
  lastUsed?: Date;
  useCount: number;
  effectiveness: number; // 0-1 based on user engagement
}

interface UserPattern {
  preferredChannels: string[];
  commonEmotions: string[];
  analysisFrequency: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  industryContext?: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

const DEFAULT_EXAMPLES: ExampleMessage[] = [
  {
    id: 'frustrated-subscription',
    text: "Hi, I've been trying to cancel my subscription for 3 days but your website keeps giving me errors. This is really frustrating and I need this resolved immediately.",
    category: 'billing',
    emotion: 'anger',
    channel: 'email',
    priority: 8,
    useCount: 0,
    effectiveness: 0.8
  },
  {
    id: 'satisfied-support',
    text: "Thank you so much for the quick resolution! Your support team went above and beyond to help me with my billing issue. Excellent customer service!",
    category: 'support',
    emotion: 'joy',
    channel: 'email',
    priority: 9,
    useCount: 0,
    effectiveness: 0.9
  },
  {
    id: 'disappointed-loyal',
    text: "The product arrived damaged and the return process is confusing. I've been a loyal customer for 5 years but this experience is disappointing.",
    category: 'shipping',
    emotion: 'sadness',
    channel: 'email',
    priority: 7,
    useCount: 0,
    effectiveness: 0.85
  },
  {
    id: 'excited-features',
    text: "Just wanted to say the new features you added are fantastic! The interface is much more intuitive now and saves me so much time.",
    category: 'product',
    emotion: 'joy',
    channel: 'review',
    priority: 6,
    useCount: 0,
    effectiveness: 0.75
  },
  {
    id: 'helpful-agent',
    text: "Your chat support agent Sarah was incredibly helpful today. She patiently walked me through the setup process and everything works perfectly now.",
    category: 'support',
    emotion: 'love',
    channel: 'chat',
    priority: 8,
    useCount: 0,
    effectiveness: 0.9
  },
  {
    id: 'order-inquiry',
    text: "I'm having trouble with my order #12345. It was supposed to arrive yesterday but tracking shows no updates. Can someone please help?",
    category: 'shipping',
    emotion: 'neutral',
    channel: 'chat',
    priority: 7,
    useCount: 0,
    effectiveness: 0.8
  },
  {
    id: 'escalated-issue',
    text: "This is the third time I'm contacting support about the same issue. No one seems to understand the problem and I'm getting different answers each time.",
    category: 'support',
    emotion: 'anger',
    channel: 'phone',
    priority: 9,
    useCount: 0,
    effectiveness: 0.95
  },
  {
    id: 'app-feedback',
    text: "Love the mobile app update! The new dark mode is exactly what I needed and the performance improvements are noticeable.",
    category: 'product',
    emotion: 'love',
    channel: 'review',
    priority: 5,
    useCount: 0,
    effectiveness: 0.7
  },
  // Additional contextual examples
  {
    id: 'urgent-security',
    text: "I just noticed unauthorized charges on my account. This is urgent - please lock my account immediately and investigate these transactions.",
    category: 'security',
    emotion: 'fear',
    channel: 'phone',
    priority: 10,
    useCount: 0,
    effectiveness: 0.95
  },
  {
    id: 'confused-pricing',
    text: "I'm confused about the pricing changes. The email wasn't clear and I can't find detailed information on your website. Can you explain?",
    category: 'billing',
    emotion: 'neutral',
    channel: 'email',
    priority: 6,
    useCount: 0,
    effectiveness: 0.75
  },
  {
    id: 'social-complaint',
    text: "Really disappointed with the service outage today. Lost important work and no communication from your team. This is unacceptable for a paid service.",
    category: 'technical',
    emotion: 'anger',
    channel: 'social',
    priority: 8,
    useCount: 0,
    effectiveness: 0.85
  },
  {
    id: 'positive-referral',
    text: "I've been recommending your service to all my colleagues. The customer support is outstanding and the product keeps getting better!",
    category: 'support',
    emotion: 'optimism',
    channel: 'review',
    priority: 7,
    useCount: 0,
    effectiveness: 0.8
  }
];

export const useAdaptiveExamples = (sentimentHistory: SentimentResult[]) => {
  const [examples, setExamples] = useState<ExampleMessage[]>(DEFAULT_EXAMPLES);
  const [userPattern, setUserPattern] = useState<UserPattern | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Analyze user patterns from sentiment history
  const analyzeUserPatterns = useCallback((history: SentimentResult[]): UserPattern => {
    if (history.length === 0) {
      return {
        preferredChannels: ['email', 'chat'],
        commonEmotions: ['neutral', 'joy'],
        analysisFrequency: 0,
        timeOfDay: 'afternoon',
        urgencyLevel: 'medium'
      };
    }

    // Analyze channels
    const channelCounts = history.reduce((acc, result) => {
      if (result.channel) {
        acc[result.channel] = (acc[result.channel] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const preferredChannels = Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([channel]) => channel);

    // Analyze emotions
    const emotionCounts = history.reduce((acc, result) => {
      acc[result.emotion] = (acc[result.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Analyze time patterns
    const currentHour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (currentHour < 12) timeOfDay = 'morning';
    else if (currentHour < 17) timeOfDay = 'afternoon';
    else if (currentHour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Analyze urgency (based on negative emotions and confidence)
    const negativeEmotions = ['anger', 'fear', 'sadness', 'disgust'];
    const urgentMessages = history.filter(result => 
      negativeEmotions.includes(result.emotion) && result.confidence > 0.8
    );
    const urgencyLevel = urgentMessages.length / history.length > 0.3 ? 'high' : 
                        urgentMessages.length / history.length > 0.1 ? 'medium' : 'low';

    return {
      preferredChannels: preferredChannels.length > 0 ? preferredChannels : ['email', 'chat'],
      commonEmotions: commonEmotions.length > 0 ? commonEmotions : ['neutral', 'joy'],
      analysisFrequency: history.length,
      timeOfDay,
      urgencyLevel
    };
  }, []);

  // Generate contextual examples based on patterns
  const generateContextualExamples = useCallback((pattern: UserPattern): ExampleMessage[] => {
    const contextualExamples: ExampleMessage[] = [];

    // Time-based examples
    if (pattern.timeOfDay === 'morning') {
      contextualExamples.push({
        id: 'morning-urgent',
        text: "Good morning, I need urgent help with my account before the business day starts. Can someone assist me immediately?",
        category: 'urgent',
        emotion: 'fear',
        channel: pattern.preferredChannels[0] || 'email',
        priority: 9,
        useCount: 0,
        effectiveness: 0.9
      });
    } else if (pattern.timeOfDay === 'evening') {
      contextualExamples.push({
        id: 'evening-feedback',
        text: "Had a great experience with your team today. Just wanted to share some positive feedback before I log off for the day.",
        category: 'feedback',
        emotion: 'joy',
        channel: pattern.preferredChannels[0] || 'email',
        priority: 6,
        useCount: 0,
        effectiveness: 0.8
      });
    }

    // Channel-specific examples
    if (pattern.preferredChannels.includes('social')) {
      contextualExamples.push({
        id: 'social-viral',
        text: "@YourCompany your latest update broke my workflow. This is trending and not in a good way. Please fix ASAP! #CustomerService",
        category: 'technical',
        emotion: 'anger',
        channel: 'social',
        priority: 10,
        useCount: 0,
        effectiveness: 0.95
      });
    }

    if (pattern.preferredChannels.includes('chat')) {
      contextualExamples.push({
        id: 'chat-quick',
        text: "Hi! Quick question - can I upgrade my plan mid-cycle? Need to know before I make the change. Thanks!",
        category: 'billing',
        emotion: 'neutral',
        channel: 'chat',
        priority: 5,
        useCount: 0,
        effectiveness: 0.7
      });
    }

    // Emotion-based examples
    if (pattern.commonEmotions.includes('anger')) {
      contextualExamples.push({
        id: 'escalated-anger',
        text: "I am absolutely furious! Your system charged me twice and customer service keeps transferring me. I want a manager NOW!",
        category: 'billing',
        emotion: 'anger',
        channel: 'phone',
        priority: 10,
        useCount: 0,
        effectiveness: 0.95
      });
    }

    if (pattern.commonEmotions.includes('joy')) {
      contextualExamples.push({
        id: 'delighted-customer',
        text: "Wow! I'm absolutely delighted with the new features. You've exceeded my expectations and I'm telling everyone about this!",
        category: 'product',
        emotion: 'joy',
        channel: 'review',
        priority: 7,
        useCount: 0,
        effectiveness: 0.85
      });
    }

    // Urgency-based examples
    if (pattern.urgencyLevel === 'high') {
      contextualExamples.push({
        id: 'critical-issue',
        text: "CRITICAL: Our production system is down due to your API changes. We need immediate assistance or we'll lose thousands in revenue.",
        category: 'technical',
        emotion: 'fear',
        channel: 'phone',
        priority: 10,
        useCount: 0,
        effectiveness: 1.0
      });
    }

    return contextualExamples;
  }, []);

  // Update examples based on usage
  const updateExampleUsage = useCallback((exampleId: string) => {
    setExamples(prev => prev.map(example => {
      if (example.id === exampleId) {
        return {
          ...example,
          useCount: example.useCount + 1,
          lastUsed: new Date(),
          effectiveness: Math.min(example.effectiveness + 0.05, 1.0) // Increase effectiveness
        };
      }
      return example;
    }));

    // Store usage data
    const usageData = JSON.parse(localStorage.getItem('example-usage') || '{}');
    usageData[exampleId] = {
      count: (usageData[exampleId]?.count || 0) + 1,
      lastUsed: new Date().toISOString()
    };
    localStorage.setItem('example-usage', JSON.stringify(usageData));

    logger.log(`Example usage updated: ${exampleId}`);
  }, []);

  // Get adaptive examples based on current context
  const getAdaptiveExamples = useMemo(() => {
    if (!userPattern) return examples.slice(0, 6);

    // Combine default and contextual examples
    const contextualExamples = generateContextualExamples(userPattern);
    const allExamples = [...examples, ...contextualExamples];

    // Score examples based on relevance
    const scoredExamples = allExamples.map(example => {
      let score = example.priority * example.effectiveness;

      // Boost score for preferred channels
      if (example.channel && userPattern.preferredChannels.includes(example.channel)) {
        score *= 1.3;
      }

      // Boost score for common emotions
      if (userPattern.commonEmotions.includes(example.emotion)) {
        score *= 1.2;
      }

      // Reduce score for overused examples
      if (example.useCount > 3) {
        score *= 0.8;
      }

      // Boost score for recent effectiveness
      if (example.lastUsed && Date.now() - example.lastUsed.getTime() < 24 * 60 * 60 * 1000) {
        score *= 1.1;
      }

      return { ...example, score };
    });

    // Sort by score and return top examples
    return scoredExamples
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ score, ...example }) => example);
  }, [examples, userPattern, generateContextualExamples]);

  // Update patterns when history changes
  useEffect(() => {
    if (sentimentHistory.length > 0) {
      const newPattern = analyzeUserPatterns(sentimentHistory);
      setUserPattern(newPattern);
      setLastUpdate(new Date());
      
      logger.log('User patterns updated:', newPattern);
    }
  }, [sentimentHistory, analyzeUserPatterns]);

  // Load usage data on mount
  useEffect(() => {
    const usageData = JSON.parse(localStorage.getItem('example-usage') || '{}');
    
    setExamples(prev => prev.map(example => {
      const usage = usageData[example.id];
      if (usage) {
        return {
          ...example,
          useCount: usage.count || 0,
          lastUsed: usage.lastUsed ? new Date(usage.lastUsed) : undefined
        };
      }
      return example;
    }));
  }, []);

  // Periodic pattern refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (sentimentHistory.length > 0) {
        const newPattern = analyzeUserPatterns(sentimentHistory);
        setUserPattern(newPattern);
        setLastUpdate(new Date());
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [sentimentHistory, analyzeUserPatterns]);

  return {
    examples: getAdaptiveExamples,
    userPattern,
    updateExampleUsage,
    lastUpdate,
    totalExamples: examples.length
  };
};