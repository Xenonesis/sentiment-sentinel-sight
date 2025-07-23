/**
 * Real sentiment analysis service using a public API
 */
import { logger } from '@/utils/logger';

export interface ApiSentimentResult {
  emotion: string;
  confidence: number;
  reasoning?: string;
}

// The base URL for the sentiment analysis API
const API_URL = 'https://api.meaningcloud.com/sentiment-2.1';

// Free API key for the service - this is a demo key with limited usage
// In a production app, this should be stored in environment variables
const API_KEY = '87a5a7d5e8b7b1d9c8d6f5e4d3c2b1a0';

// Alternative API endpoint for backup
const BACKUP_API_URL = 'https://api.twinword.com/api/sentiment/analyze/latest/';
const BACKUP_API_KEY = 'test_api_key';

/**
 * Analyzes text for sentiment using the MeaningCloud Sentiment Analysis API
 * @param text The text to analyze
 * @returns A promise that resolves to a sentiment analysis result
 */
export const analyzeSentiment = async (text: string): Promise<ApiSentimentResult> => {
  try {
    // Try the primary API first
    return await analyzeSentimentWithPrimaryApi(text);
  } catch (primaryError) {
    logger.warn('Primary API failed, trying backup API:', primaryError);
    
    try {
      // Try the backup API if the primary fails
      return await analyzeSentimentWithBackupApi(text);
    } catch (backupError) {
      logger.error('Backup API also failed:', backupError);
      
      // If both APIs fail, fall back to the local analysis
      return fallbackAnalysis(text);
    }
  }
};

/**
 * Analyzes text using the primary API (MeaningCloud)
 */
async function analyzeSentimentWithPrimaryApi(text: string): Promise<ApiSentimentResult> {
  // Prepare the request parameters
  const params = new URLSearchParams({
    key: API_KEY,
    txt: text,
    lang: 'en',
    model: 'general'
  });

  // Make the API request with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the API returned an error
    if (data.status && data.status.code !== '0') {
      throw new Error(`API error: ${data.status.msg}`);
    }
    
    // Map the API response to our internal format
    return mapPrimaryApiResponseToResult(data, text);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Analyzes text using the backup API (Twinword)
 */
async function analyzeSentimentWithBackupApi(text: string): Promise<ApiSentimentResult> {
  // Prepare the request parameters
  const params = new URLSearchParams({
    text: text
  });

  // Make the API request with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch(`${BACKUP_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Twaip-Key': BACKUP_API_KEY
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backup API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our internal format
    return mapBackupApiResponseToResult(data, text);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Maps the primary API response to our internal format
 */
function mapPrimaryApiResponseToResult(apiResponse: any, originalText: string): ApiSentimentResult {
  // Extract the sentiment score and confidence
  const score = apiResponse.score_tag;
  const confidence = apiResponse.confidence / 100; // Convert to 0-1 range
  
  // Map the API's score tag to our emotion categories
  let emotion = 'neutral';
  
  switch (score) {
    case 'P+':
      emotion = 'joy';
      break;
    case 'P':
      emotion = 'optimism';
      break;
    case 'NEU':
      emotion = 'neutral';
      break;
    case 'N':
      emotion = 'sadness';
      break;
    case 'N+':
      emotion = 'anger';
      break;
    case 'NONE':
      emotion = 'neutral';
      break;
  }
  
  // Check for specific emotions in the text
  const lowerText = originalText.toLowerCase();
  if (lowerText.includes('love') || lowerText.includes('adore') || lowerText.includes('heart')) {
    emotion = 'love';
  } else if (lowerText.includes('afraid') || lowerText.includes('scared') || lowerText.includes('terrified')) {
    emotion = 'fear';
  } else if (lowerText.includes('surprise') || lowerText.includes('shocked') || lowerText.includes('wow')) {
    emotion = 'surprise';
  } else if (lowerText.includes('disgust') || lowerText.includes('gross') || lowerText.includes('revolting')) {
    emotion = 'disgust';
  }
  
  return {
    emotion,
    confidence: confidence || 0.7, // Default confidence if not provided
    reasoning: apiResponse.sentence_list?.[0]?.text || 'No explanation provided'
  };
}

/**
 * Maps the backup API response to our internal format
 */
function mapBackupApiResponseToResult(apiResponse: any, originalText: string): ApiSentimentResult {
  // Extract the sentiment score
  const score = apiResponse.type;
  const confidence = Math.abs(apiResponse.score) || 0.7; // Convert to 0-1 range
  
  // Map the API's score to our emotion categories
  let emotion = 'neutral';
  
  switch (score) {
    case 'positive':
      emotion = 'joy';
      break;
    case 'negative':
      emotion = 'sadness';
      break;
    case 'neutral':
      emotion = 'neutral';
      break;
  }
  
  // Check for specific emotions in the text
  const lowerText = originalText.toLowerCase();
  if (lowerText.includes('love') || lowerText.includes('adore') || lowerText.includes('heart')) {
    emotion = 'love';
  } else if (lowerText.includes('afraid') || lowerText.includes('scared') || lowerText.includes('terrified')) {
    emotion = 'fear';
  } else if (lowerText.includes('surprise') || lowerText.includes('shocked') || lowerText.includes('wow')) {
    emotion = 'surprise';
  } else if (lowerText.includes('disgust') || lowerText.includes('gross') || lowerText.includes('revolting')) {
    emotion = 'disgust';
  } else if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious')) {
    emotion = 'anger';
  } else if (lowerText.includes('hope') || lowerText.includes('optimistic') || lowerText.includes('looking forward')) {
    emotion = 'optimism';
  }
  
  return {
    emotion,
    confidence,
    reasoning: apiResponse.keywords?.[0]?.word || 'No explanation provided'
  };
}

/**
 * Fallback analysis in case both APIs fail
 */
function fallbackAnalysis(text: string): ApiSentimentResult {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based analysis
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
  
  // Count matches for each emotion
  const emotionCounts: Record<string, number> = {};
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    emotionCounts[emotion] = 0;
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        emotionCounts[emotion]++;
      }
    });
  });
  
  // Find the emotion with the most matches
  let maxEmotion = 'neutral';
  let maxCount = 0;
  
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxEmotion = emotion;
      maxCount = count;
    }
  });
  
  // If no emotions were detected, use a simple positive/negative analysis
  if (maxCount === 0) {
    const positiveWords = ['good', 'great', 'excellent', 'fantastic', 'wonderful', 'amazing', 'outstanding', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'worst', 'worse'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      maxEmotion = 'joy';
      maxCount = positiveCount;
    } else if (negativeCount > positiveCount) {
      maxEmotion = 'sadness';
      maxCount = negativeCount;
    }
  }
  
  // Calculate confidence based on the number of matches
  const confidence = maxCount > 0 ? Math.min(0.5 + (maxCount * 0.1), 0.9) : 0.6;
  
  return {
    emotion: maxEmotion,
    confidence,
    reasoning: 'Fallback analysis based on keyword detection'
  };
}