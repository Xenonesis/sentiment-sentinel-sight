import { useCallback } from 'react';
import { SentimentResult } from './useSentimentAnalysis';

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange?: {
    start: Date;
    end: Date;
  };
  emotions?: string[];
  channels?: string[];
  minConfidence?: number;
}

export const useDataExport = () => {
  const filterSentiments = useCallback((
    sentiments: SentimentResult[], 
    options: ExportOptions
  ): SentimentResult[] => {
    let filtered = [...sentiments];

    // Filter by date range
    if (options.dateRange) {
      filtered = filtered.filter(s => 
        s.timestamp >= options.dateRange!.start && 
        s.timestamp <= options.dateRange!.end
      );
    }

    // Filter by emotions
    if (options.emotions && options.emotions.length > 0) {
      filtered = filtered.filter(s => 
        options.emotions!.includes(s.emotion.toLowerCase())
      );
    }

    // Filter by channels
    if (options.channels && options.channels.length > 0) {
      filtered = filtered.filter(s => 
        s.channel && options.channels!.includes(s.channel)
      );
    }

    // Filter by minimum confidence
    if (options.minConfidence !== undefined) {
      filtered = filtered.filter(s => s.confidence >= options.minConfidence!);
    }

    return filtered;
  }, []);

  const exportToCSV = useCallback((
    sentiments: SentimentResult[], 
    options: ExportOptions = { format: 'csv' }
  ) => {
    const filtered = filterSentiments(sentiments, options);
    
    const headers = [
      'Timestamp',
      'Message',
      'Emotion',
      'Confidence (%)',
      'Customer ID',
      'Channel'
    ];

    const rows = filtered.map(sentiment => [
      sentiment.timestamp.toISOString(),
      `"${sentiment.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
      sentiment.emotion,
      (sentiment.confidence * 100).toFixed(1),
      sentiment.customerId || '',
      sentiment.channel || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    return {
      success: true,
      exportedCount: filtered.length,
      totalCount: sentiments.length
    };
  }, [filterSentiments]);

  const exportToJSON = useCallback((
    sentiments: SentimentResult[], 
    options: ExportOptions = { format: 'json' }
  ) => {
    const filtered = filterSentiments(sentiments, options);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRecords: filtered.length,
      filters: options,
      data: filtered.map(sentiment => ({
        timestamp: sentiment.timestamp.toISOString(),
        message: sentiment.message,
        emotion: sentiment.emotion,
        confidence: sentiment.confidence,
        customerId: sentiment.customerId,
        channel: sentiment.channel
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    return {
      success: true,
      exportedCount: filtered.length,
      totalCount: sentiments.length
    };
  }, [filterSentiments]);

  const exportData = useCallback((
    sentiments: SentimentResult[], 
    options: ExportOptions
  ) => {
    if (options.format === 'csv') {
      return exportToCSV(sentiments, options);
    } else if (options.format === 'json') {
      return exportToJSON(sentiments, options);
    } else {
      throw new Error(`Unsupported export format: ${options.format}`);
    }
  }, [exportToCSV, exportToJSON]);

  const getExportPreview = useCallback((
    sentiments: SentimentResult[], 
    options: ExportOptions
  ) => {
    const filtered = filterSentiments(sentiments, options);
    return {
      totalRecords: sentiments.length,
      filteredRecords: filtered.length,
      preview: filtered.slice(0, 5), // First 5 records for preview
      dateRange: filtered.length > 0 ? {
        earliest: new Date(Math.min(...filtered.map(s => s.timestamp.getTime()))),
        latest: new Date(Math.max(...filtered.map(s => s.timestamp.getTime())))
      } : null
    };
  }, [filterSentiments]);

  return {
    exportData,
    exportToCSV,
    exportToJSON,
    getExportPreview
  };
};