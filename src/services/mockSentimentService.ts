/**
 * Mock sentiment analysis service that provides reliable emotion detection
 * without requiring external model loading
 */

export interface MockEmotionResult {
  label: string;
  score: number;
}

// List of emotions our mock service can detect
const emotions = [
  'joy', 'sadness', 'anger', 'fear', 'surprise', 
  'disgust', 'neutral', 'love', 'optimism'
];

// Keywords that strongly indicate specific emotions
const emotionKeywords: Record<string, string[]> = {
  joy: ['happy', 'excited', 'glad', 'delighted', 'pleased', 'thrilled', 'enjoy', 'wonderful', 'great', 'excellent'],
  sadness: ['sad', 'unhappy', 'depressed', 'miserable', 'disappointed', 'upset', 'sorry', 'regret', 'heartbroken'],
  anger: ['angry', 'mad', 'furious', 'outraged', 'annoyed', 'irritated', 'frustrated', 'hate', 'terrible'],
  fear: ['afraid', 'scared', 'frightened', 'terrified', 'worried', 'anxious', 'nervous', 'concerned'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow', 'unbelievable'],
  disgust: ['disgusted', 'gross', 'revolting', 'awful', 'nasty', 'horrible', 'repulsive'],
  love: ['love', 'adore', 'cherish', 'affection', 'fond', 'care', 'appreciate'],
  optimism: ['hopeful', 'optimistic', 'confident', 'positive', 'promising', 'looking forward', 'believe', 'trust']
};

// Positive and negative sentiment words
const positiveWords = [
  'good', 'great', 'excellent', 'fantastic', 'wonderful', 'amazing', 'outstanding', 'perfect',
  'best', 'better', 'helpful', 'impressive', 'satisfied', 'thank', 'thanks', 'appreciate',
  'pleased', 'happy', 'glad', 'delighted', 'love', 'like', 'enjoy', 'recommend'
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'worst', 'worse',
  'useless', 'unhelpful', 'dissatisfied', 'frustrated', 'annoyed', 'angry', 'hate',
  'dislike', 'problem', 'issue', 'broken', 'fail', 'failed', 'not working', 'doesn\'t work'
];

/**
 * Analyzes text for sentiment and emotion using a rule-based approach
 * @param text The text to analyze
 * @returns An array of emotion scores
 */
export const analyzeSentiment = (text: string): MockEmotionResult[] => {
  if (!text || text.trim() === '') {
    return [{ label: 'neutral', score: 1.0 }];
  }
  
  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split(/\s+/);
  
  // Initialize scores for each emotion
  const scores: Record<string, number> = {};
  emotions.forEach(emotion => {
    scores[emotion] = 0;
  });
  
  // Basic sentiment analysis
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Count positive and negative words
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) {
      positiveScore++;
    }
    if (negativeWords.some(nw => word.includes(nw))) {
      negativeScore++;
    }
  });
  
  // Check for emotion keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        scores[emotion] += 0.3;
      }
    });
  });
  
  // Adjust scores based on positive/negative sentiment
  if (positiveScore > negativeScore) {
    scores.joy += 0.2;
    scores.optimism += 0.2;
  } else if (negativeScore > positiveScore) {
    scores.sadness += 0.1;
    scores.anger += 0.1;
  } else {
    scores.neutral += 0.3;
  }
  
  // Ensure neutral has a base score
  scores.neutral = Math.max(0.1, scores.neutral);
  
  // If no strong emotions detected, increase neutral
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore < 0.3) {
    scores.neutral = 0.5;
  }
  
  // Normalize scores
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  if (totalScore > 0) {
    Object.keys(scores).forEach(emotion => {
      scores[emotion] = scores[emotion] / totalScore;
    });
  }
  
  // Convert to array and sort by score
  const result = Object.entries(scores)
    .map(([label, score]) => ({ label, score }))
    .sort((a, b) => b.score - a.score);
  
  // Ensure the top emotion has a reasonable confidence
  if (result[0].score < 0.4) {
    result[0].score = 0.4 + (Math.random() * 0.3);
  }
  
  return result;
};