// Ollama local AI integration for sentiment analysis
import { getAdvancedSettings, getCustomModel } from './apiPreferencesService';
import { networkManager } from '@/utils/networkManager';
import { ErrorClassifier } from '@/utils/errorClassifier';
export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaSentimentResult {
  emotion: string;
  confidence: number;
  reasoning?: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Check if Ollama is running and accessible
 */
import { logger } from '@/utils/logger';

export const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    logger.log('Ollama not available:', error);
    return false;
  }
};

/**
 * Get list of available models from Ollama
 */
export const getOllamaModels = async (): Promise<OllamaModel[]> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    logger.error('Error fetching Ollama models:', error);
    throw new Error('Failed to fetch Ollama models. Make sure Ollama is running.');
  }
};

/**
 * Analyze sentiment using Ollama with the specified model
 */
export const analyzeWithOllama = async (
  message: string,
  modelName?: string
): Promise<OllamaSentimentResult> => {
  const startTime = Date.now();
  const settings = getAdvancedSettings();
  const model = modelName || getCustomModel('ollama');
  const prompt = `Analyze the sentiment and emotion of this customer message. Return your response in this exact JSON format:
{
  "emotion": "one of: joy, anger, fear, sadness, surprise, disgust, love, optimism, neutral",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Customer message: "${message}"

Important: Respond with only the JSON object, no other text. Do not include any markdown formatting or additional text outside the JSON.`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), settings.timeout);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: settings.modelParameters.ollama.temperature,
          top_k: settings.modelParameters.ollama.top_k,
          top_p: settings.modelParameters.ollama.top_p,
          num_predict: 200,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    const text = data.response;

    if (!text) {
      throw new Error('No response from Ollama');
    }

    // Try to extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: try to parse the entire response as JSON
      jsonMatch = [text.trim()];
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // If JSON parsing fails, try to extract emotion from text
      const emotionKeywords = {
        joy: ['happy', 'joy', 'excited', 'pleased', 'delighted', 'positive'],
        anger: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated'],
        fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'fearful'],
        sadness: ['sad', 'depressed', 'disappointed', 'unhappy', 'melancholy'],
        surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'unexpected'],
        disgust: ['disgusted', 'revolted', 'repulsed', 'sickened'],
        love: ['love', 'adore', 'cherish', 'affection', 'romantic'],
        optimism: ['optimistic', 'hopeful', 'confident', 'positive', 'encouraging'],
        neutral: ['neutral', 'normal', 'calm', 'balanced', 'indifferent']
      };

      let detectedEmotion = 'neutral';
      let maxMatches = 0;

      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        const matches = keywords.filter(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        if (matches > maxMatches) {
          maxMatches = matches;
          detectedEmotion = emotion;
        }
      }

      result = {
        emotion: detectedEmotion,
        confidence: maxMatches > 0 ? 0.7 : 0.5,
        reasoning: `Detected from text analysis: ${text.substring(0, 100)}...`
      };
    }

    // Validate the response format
    if (!result.emotion || typeof result.confidence !== 'number') {
      throw new Error('Invalid response format from Ollama');
    }

    // Ensure confidence is between 0 and 1
    if (result.confidence > 1) {
      result.confidence = result.confidence / 100;
    }

    const finalResult = {
      emotion: result.emotion,
      confidence: Math.min(Math.max(result.confidence, 0), 1),
      reasoning: result.reasoning || 'Analysis completed by Ollama'
    };

    // Record success
    networkManager.recordSuccess('ollama', Date.now() - startTime);
    return finalResult;

  } catch (error) {
    clearTimeout(timeoutId);
    
    // Classify and record the error
    const classifiedError = ErrorClassifier.classify(error as Error, 'ollama');
    networkManager.recordFailure('ollama', error as Error);
    
    logger.error('Ollama API error:', classifiedError.userMessage);
    
    // Throw with classified error message
    throw new Error(classifiedError.userMessage);
  }
};

/**
 * Test if a specific model is available and working
 */
export const testOllamaModel = async (modelName: string): Promise<boolean> => {
  try {
    const result = await analyzeWithOllama('This is a test message', modelName);
    return !!result.emotion;
  } catch (error) {
    logger.error(`Error testing Ollama model ${modelName}:`, error);
    return false;
  }
};

/**
 * Get the configured Ollama model from localStorage
 */
export const getConfiguredOllamaModel = (): string | null => {
  return localStorage.getItem('ollama_model');
};

/**
 * Set the Ollama model in localStorage
 */
export const setConfiguredOllamaModel = (modelName: string): void => {
  localStorage.setItem('ollama_model', modelName);
};

/**
 * Check if Ollama is configured (has a selected model)
 */
export const isOllamaConfigured = (): boolean => {
  const model = getConfiguredOllamaModel();
  return !!model && model.trim().length > 0;
};

/**
 * Get recommended models for sentiment analysis
 */
export const getRecommendedModels = (): string[] => {
  return [
    'llama2',
    'llama2:13b',
    'llama2:70b',
    'mistral',
    'mistral:7b',
    'codellama',
    'neural-chat',
    'starling-lm',
    'openchat',
    'vicuna',
    'orca-mini',
    'dolphin-mistral'
  ];
};

/**
 * Check if a model name is recommended for sentiment analysis
 */
export const isRecommendedModel = (modelName: string): boolean => {
  const recommended = getRecommendedModels();
  return recommended.some(rec => modelName.toLowerCase().includes(rec.toLowerCase()));
};