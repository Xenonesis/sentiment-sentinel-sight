/**
 * User Settings Hook
 * Manages persistence of all user preferences and form data
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface UserFormSettings {
  lastCustomerId: string;
  lastChannel: string;
  lastMessage: string;
  rememberFormData: boolean;
}

export interface UserUISettings {
  showAdvancedAnalytics: boolean;
  defaultView: 'simple' | 'advanced';
  autoSaveResults: boolean;
  showTooltips: boolean;
  compactMode: boolean;
}

export interface UserSettings {
  form: UserFormSettings;
  ui: UserUISettings;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  form: {
    lastCustomerId: '',
    lastChannel: '',
    lastMessage: '',
    rememberFormData: true
  },
  ui: {
    showAdvancedAnalytics: false,
    defaultView: 'simple',
    autoSaveResults: true,
    showTooltips: true,
    compactMode: false
  },
  lastUpdated: new Date().toISOString()
};

const SETTINGS_KEY = 'user_settings';

/**
 * Hook for managing user settings persistence
 */
export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          form: {
            ...DEFAULT_SETTINGS.form,
            ...parsed.form
          },
          ui: {
            ...DEFAULT_SETTINGS.ui,
            ...parsed.ui
          }
        };
      }
    } catch (error) {
      logger.error('Error loading user settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settingsToSave = {
        ...settings,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      logger.error('Error saving user settings:', error);
    }
  }, [settings]);

  // Update form settings
  const updateFormSettings = useCallback((updates: Partial<UserFormSettings>) => {
    setSettings(prev => ({
      ...prev,
      form: {
        ...prev.form,
        ...updates
      }
    }));
  }, []);

  // Update UI settings
  const updateUISettings = useCallback((updates: Partial<UserUISettings>) => {
    setSettings(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        ...updates
      }
    }));
  }, []);

  // Save form data (customer ID, channel, message)
  const saveFormData = useCallback((customerId: string, channel: string, message: string) => {
    if (settings.form.rememberFormData) {
      updateFormSettings({
        lastCustomerId: customerId,
        lastChannel: channel,
        lastMessage: message
      });
    }
  }, [settings.form.rememberFormData, updateFormSettings]);

  // Clear form data
  const clearFormData = useCallback(() => {
    updateFormSettings({
      lastCustomerId: '',
      lastChannel: '',
      lastMessage: ''
    });
  }, [updateFormSettings]);

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_KEY);
  }, []);

  // Get storage info
  const getStorageInfo = useCallback(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      const sizeInBytes = saved ? new Blob([saved]).size : 0;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return {
        sizeInKB,
        lastUpdated: settings.lastUpdated
      };
    } catch (error) {
      return {
        sizeInKB: 0,
        lastUpdated: settings.lastUpdated
      };
    }
  }, [settings.lastUpdated]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
        } catch (error) {
          logger.error('Error parsing settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    settings,
    updateFormSettings,
    updateUISettings,
    saveFormData,
    clearFormData,
    resetSettings,
    getStorageInfo
  };
};