// Google Gemini API integration for sentiment analysis
import { logger } from '@/utils/logger';

export interface GeminiSentimentResult {
  emotion: string;
  confidence: number;
  reasoning?: string;
}

export const analyzeWithGemini = async (message: string): Promise<GeminiSentimentResult> => {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
    throw new Error('Google Gemini API key not configured. Please add it in Settings.');
  }

  const prompt = `Analyze the sentiment and emotion of this customer message. Return your response in this exact JSON format:
{
  "emotion": "one of: joy, anger, fear, sadness, surprise, disgust, love, optimism, neutral",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Customer message: "${message}"

Important: Respond with only the JSON object, no other text. Do not include any markdown formatting or additional text outside the JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Try to extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: try to parse the entire response as JSON
      jsonMatch = [text];
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!result.emotion || typeof result.confidence !== 'number') {
      throw new Error('Invalid response format from Gemini API');
    }

    // Ensure confidence is between 0 and 1
    if (result.confidence > 1) {
      result.confidence = result.confidence / 100;
    }

    return {
      emotion: result.emotion,
      confidence: Math.min(Math.max(result.confidence, 0), 1),
      reasoning: result.reasoning
    };

  } catch (error) {
    logger.error('Gemini API error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
    
    throw new Error('Gemini analysis failed: Unknown error');
  }
};

export const isGeminiConfigured = (): boolean => {
  const apiKey = localStorage.getItem('gemini_api_key');
  return !!apiKey && apiKey.trim().length > 0;
};