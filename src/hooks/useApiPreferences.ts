import { useState, useCallback, useEffect } from 'react';
import {
  ApiProvider,
  ApiPreferences,
  getApiPreferences,
  saveApiPreferences,
  setDefaultProvider,
  setProviderEnabled,
  setProviderOrder,
  setModelEnabled,
  isProviderEnabled,
  isModelEnabled,
  getEnabledProvidersInOrder,
  resetApiPreferences
} from '@/services/apiPreferencesService';

export const useApiPreferences = () => {
  const [preferences, setPreferences] = useState<ApiPreferences>(getApiPreferences());

  // Reload preferences from localStorage
  const reloadPreferences = useCallback(() => {
    setPreferences(getApiPreferences());
  }, []);

  // Update default provider
  const updateDefaultProvider = useCallback((provider: ApiProvider) => {
    setDefaultProvider(provider);
    reloadPreferences();
  }, [reloadPreferences]);

  // Toggle provider enabled state
  const toggleProvider = useCallback((provider: ApiProvider, enabled?: boolean) => {
    const newState = enabled ?? !isProviderEnabled(provider);
    setProviderEnabled(provider, newState);
    reloadPreferences();
  }, [reloadPreferences]);

  // Update provider order
  const updateProviderOrder = useCallback((order: ApiProvider[]) => {
    setProviderOrder(order);
    reloadPreferences();
  }, [reloadPreferences]);

  // Toggle model enabled state
  const toggleModel = useCallback((modelName: string, enabled?: boolean) => {
    const newState = enabled ?? !isModelEnabled(modelName);
    setModelEnabled(modelName, newState);
    reloadPreferences();
  }, [reloadPreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    resetApiPreferences();
    reloadPreferences();
  }, [reloadPreferences]);

  // Get enabled providers in order
  const getEnabledProviders = useCallback(() => {
    return getEnabledProvidersInOrder();
  }, []);

  // Check if provider is enabled
  const checkProviderEnabled = useCallback((provider: ApiProvider) => {
    return isProviderEnabled(provider);
  }, []);

  // Check if model is enabled
  const checkModelEnabled = useCallback((modelName: string) => {
    return isModelEnabled(modelName);
  }, []);

  // Save custom preferences
  const saveCustomPreferences = useCallback((newPreferences: Partial<ApiPreferences>) => {
    const current = getApiPreferences();
    const updated = { ...current, ...newPreferences };
    saveApiPreferences(updated);
    reloadPreferences();
  }, [reloadPreferences]);

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'api_preferences') {
        reloadPreferences();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [reloadPreferences]);

  return {
    preferences,
    updateDefaultProvider,
    toggleProvider,
    updateProviderOrder,
    toggleModel,
    resetPreferences,
    getEnabledProviders,
    checkProviderEnabled,
    checkModelEnabled,
    saveCustomPreferences,
    reloadPreferences
  };
};