/**
 * API Preferences Service
 * Manages user preferences for API priority and model availability
 */

export type ApiProvider = 'huggingface' | 'ollama' | 'gemini' | 'sentiment-api';

import { logger } from '@/utils/logger';

export interface AdvancedSettings {
  timeout: number; // in milliseconds
  retryAttempts: number;
  customModels: Record<ApiProvider, string>;
  modelParameters: {
    gemini: {
      temperature: number;
      topK: number;
      topP: number;
      maxOutputTokens: number;
    };
    ollama: {
      temperature: number;
      top_p: number;
      top_k: number;
    };
  };
}

export interface ApiPreferences {
  defaultProvider: ApiProvider;
  providerOrder: ApiProvider[];
  enabledProviders: Record<ApiProvider, boolean>;
  enabledModels: Record<string, boolean>;
  advancedSettings: AdvancedSettings;
}

const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  timeout: 30000, // 30 seconds default
  retryAttempts: 2,
  customModels: {
    'huggingface': 'cardiffnlp/twitter-roberta-base-sentiment-latest',
    'ollama': 'llama2',
    'gemini': 'gemini-2.0-flash',
    'sentiment-api': 'general'
  },
  modelParameters: {
    gemini: {
      temperature: 0.3,
      topK: 1,
      topP: 0.8,
      maxOutputTokens: 200
    },
    ollama: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40
    }
  }
};

const DEFAULT_PREFERENCES: ApiPreferences = {
  defaultProvider: 'huggingface',
  providerOrder: ['huggingface', 'ollama', 'gemini', 'sentiment-api'],
  enabledProviders: {
    'huggingface': true,
    'ollama': true,
    'gemini': true,
    'sentiment-api': true
  },
  enabledModels: {},
  advancedSettings: DEFAULT_ADVANCED_SETTINGS
};

const PREFERENCES_KEY = 'api_preferences';

/**
 * Get current API preferences
 */
export const getApiPreferences = (): ApiPreferences => {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        enabledProviders: {
          ...DEFAULT_PREFERENCES.enabledProviders,
          ...parsed.enabledProviders
        },
        advancedSettings: {
          ...DEFAULT_ADVANCED_SETTINGS,
          ...parsed.advancedSettings,
          customModels: {
            ...DEFAULT_ADVANCED_SETTINGS.customModels,
            ...parsed.advancedSettings?.customModels
          },
          modelParameters: {
            ...DEFAULT_ADVANCED_SETTINGS.modelParameters,
            ...parsed.advancedSettings?.modelParameters,
            gemini: {
              ...DEFAULT_ADVANCED_SETTINGS.modelParameters.gemini,
              ...parsed.advancedSettings?.modelParameters?.gemini
            },
            ollama: {
              ...DEFAULT_ADVANCED_SETTINGS.modelParameters.ollama,
              ...parsed.advancedSettings?.modelParameters?.ollama
            }
          }
        }
      };
    }
  } catch (error) {
    logger.error('Error loading API preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};

/**
 * Save API preferences
 */
export const saveApiPreferences = (preferences: ApiPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    logger.error('Error saving API preferences:', error);
  }
};

/**
 * Set default API provider
 */
export const setDefaultProvider = (provider: ApiProvider): void => {
  const preferences = getApiPreferences();
  preferences.defaultProvider = provider;
  
  // Move the default provider to the front of the order
  preferences.providerOrder = [
    provider,
    ...preferences.providerOrder.filter(p => p !== provider)
  ];
  
  saveApiPreferences(preferences);
};

/**
 * Enable or disable an API provider
 */
export const setProviderEnabled = (provider: ApiProvider, enabled: boolean): void => {
  const preferences = getApiPreferences();
  preferences.enabledProviders[provider] = enabled;
  
  // If disabling the default provider, set a new default
  if (!enabled && preferences.defaultProvider === provider) {
    const enabledProviders = preferences.providerOrder.filter(
      p => p !== provider && preferences.enabledProviders[p]
    );
    if (enabledProviders.length > 0) {
      preferences.defaultProvider = enabledProviders[0];
    }
  }
  
  saveApiPreferences(preferences);
};

/**
 * Set provider order for fallback sequence
 */
export const setProviderOrder = (order: ApiProvider[]): void => {
  const preferences = getApiPreferences();
  preferences.providerOrder = order;
  saveApiPreferences(preferences);
};

/**
 * Enable or disable a specific model
 */
export const setModelEnabled = (modelName: string, enabled: boolean): void => {
  const preferences = getApiPreferences();
  preferences.enabledModels[modelName] = enabled;
  saveApiPreferences(preferences);
};

/**
 * Check if a provider is enabled
 */
export const isProviderEnabled = (provider: ApiProvider): boolean => {
  const preferences = getApiPreferences();
  return preferences.enabledProviders[provider] ?? true;
};

/**
 * Check if a model is enabled
 */
export const isModelEnabled = (modelName: string): boolean => {
  const preferences = getApiPreferences();
  return preferences.enabledModels[modelName] ?? true;
};

/**
 * Get enabled providers in order of preference
 */
export const getEnabledProvidersInOrder = (): ApiProvider[] => {
  const preferences = getApiPreferences();
  return preferences.providerOrder.filter(provider => 
    preferences.enabledProviders[provider]
  );
};

/**
 * Get provider display name
 */
export const getProviderDisplayName = (provider: ApiProvider): string => {
  const names: Record<ApiProvider, string> = {
    'huggingface': 'HuggingFace (Local)',
    'ollama': 'Ollama (Local AI)',
    'gemini': 'Google Gemini',
    'sentiment-api': 'Sentiment Analysis API'
  };
  return names[provider];
};

/**
 * Get provider description
 */
export const getProviderDescription = (provider: ApiProvider): string => {
  const descriptions: Record<ApiProvider, string> = {
    'huggingface': 'Runs locally in browser, no API key needed',
    'ollama': 'Local AI models, complete privacy',
    'gemini': 'Google\'s advanced AI model',
    'sentiment-api': 'Cloud-based sentiment analysis'
  };
  return descriptions[provider];
};

/**
 * Update advanced settings
 */
export const updateAdvancedSettings = (settings: Partial<AdvancedSettings>): void => {
  const preferences = getApiPreferences();
  preferences.advancedSettings = {
    ...preferences.advancedSettings,
    ...settings,
    customModels: {
      ...preferences.advancedSettings.customModels,
      ...settings.customModels
    },
    modelParameters: {
      ...preferences.advancedSettings.modelParameters,
      ...settings.modelParameters,
      gemini: {
        ...preferences.advancedSettings.modelParameters.gemini,
        ...settings.modelParameters?.gemini
      },
      ollama: {
        ...preferences.advancedSettings.modelParameters.ollama,
        ...settings.modelParameters?.ollama
      }
    }
  };
  saveApiPreferences(preferences);
};

/**
 * Get current advanced settings
 */
export const getAdvancedSettings = (): AdvancedSettings => {
  const preferences = getApiPreferences();
  return preferences.advancedSettings;
};

/**
 * Update custom model for a provider
 */
export const setCustomModel = (provider: ApiProvider, model: string): void => {
  const preferences = getApiPreferences();
  preferences.advancedSettings.customModels[provider] = model;
  saveApiPreferences(preferences);
};

/**
 * Get custom model for a provider
 */
export const getCustomModel = (provider: ApiProvider): string => {
  const preferences = getApiPreferences();
  return preferences.advancedSettings.customModels[provider] || DEFAULT_ADVANCED_SETTINGS.customModels[provider];
};

/**
 * Update timeout setting
 */
export const setTimeout = (timeout: number): void => {
  const preferences = getApiPreferences();
  preferences.advancedSettings.timeout = Math.max(1000, Math.min(120000, timeout)); // 1s to 2min
  saveApiPreferences(preferences);
};

/**
 * Get current timeout setting
 */
export const getTimeout = (): number => {
  const preferences = getApiPreferences();
  return preferences.advancedSettings.timeout;
};

/**
 * Reset preferences to defaults
 */
export const resetApiPreferences = (): void => {
  localStorage.removeItem(PREFERENCES_KEY);
};