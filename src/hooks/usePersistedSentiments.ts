import { useState, useEffect } from 'react';
import { SentimentResult } from './useSentimentAnalysis';

const STORAGE_KEY = 'sentiment-history';
const MAX_STORED_ITEMS = 1000; // Prevent localStorage from getting too large

export const usePersistedSentiments = () => {
  const [sentiments, setSentiments] = useState<SentimentResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((item: SentimentResult & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load sentiment history from localStorage:', error);
    }
    return [];
  });

  // Auto-save whenever sentiments change
  useEffect(() => {
    try {
      // Keep only the most recent items to prevent localStorage overflow
      const itemsToStore = sentiments.slice(-MAX_STORED_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToStore));
    } catch (error) {
      console.error('Failed to save sentiment history to localStorage:', error);
      // If storage is full, try to clear old data and save again
      try {
        const recentItems = sentiments.slice(-500); // Keep only 500 most recent
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
      } catch (retryError) {
        console.error('Failed to save even reduced sentiment history:', retryError);
      }
    }
  }, [sentiments]);

  const addSentiment = (sentiment: SentimentResult) => {
    setSentiments(prev => [...prev, sentiment]);
  };

  const clearHistory = () => {
    setSentiments([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getStorageInfo = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const sizeInBytes = saved ? new Blob([saved]).size : 0;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return {
        itemCount: sentiments.length,
        sizeInKB,
        maxItems: MAX_STORED_ITEMS
      };
    } catch (error) {
      return {
        itemCount: sentiments.length,
        sizeInKB: 0,
        maxItems: MAX_STORED_ITEMS
      };
    }
  };

  return {
    sentiments,
    setSentiments,
    addSentiment,
    clearHistory,
    getStorageInfo
  };
};