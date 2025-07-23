/**
 * API Preferences Service
 * Manages user preferences for API priority and model availability
 */

export type ApiProvider = 'huggingface' | 'ollama' | 'gemini' | 'sentiment-api';

import { logger } from '@/utils/logger';

export interface ApiPreferences {
  defaultProvider: ApiProvider;
  providerOrder: ApiProvider[];
  enabledProviders: Record<ApiProvider, boolean>;
  enabledModels: Record<string, boolean>;
}

const DEFAULT_PREFERENCES: ApiPreferences = {
  defaultProvider: 'huggingface',
  providerOrder: ['huggingface', 'ollama', 'gemini', 'sentiment-api'],
  enabledProviders: {
    'huggingface': true,
    'ollama': true,
    'gemini': true,
    'sentiment-api': true
  },
  enabledModels: {}
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
 * Reset preferences to defaults
 */
export const resetApiPreferences = (): void => {
  localStorage.removeItem(PREFERENCES_KEY);
};