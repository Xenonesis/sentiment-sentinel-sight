# API Preferences Implementation

> **Updated in v1.1.9**: Enhanced with circuit breaker protection and network monitoring

## Overview
Successfully implemented a comprehensive API preferences system that allows users to:

1. **Set Default API Provider** - Users can choose their preferred primary API (Ollama, Gemini, HuggingFace, Sentiment API)
2. **Enable/Disable Providers** - Toggle individual API providers on/off
3. **Reorder Provider Priority** - Customize the fallback sequence when providers fail
4. **Model Management** - Enable/disable specific Ollama models
5. **Persistent Settings** - All preferences saved in localStorage

## Files Created/Modified

### New Files:
- `src/services/apiPreferencesService.ts` - Core preferences management service
- `src/hooks/useApiPreferences.ts` - React hook for preferences management
- `src/components/ApiPreferencesTab.tsx` - Enhanced UI for preferences configuration

### Modified Files:
- `src/hooks/useSentimentAnalysis.ts` - Updated to use preference-based provider selection
- `src/components/SettingsPage.tsx` - Added new preferences tab

## Key Features

### 1. Smart Provider Selection
The system now respects user preferences when selecting APIs:
```typescript
// Get enabled providers in user's preferred order
const enabledProviders = getEnabledProvidersInOrder();

// Try each provider in order until one succeeds
for (const provider of enabledProviders) {
  // Provider-specific logic...
}
```

### 2. Flexible Configuration
Users can:
- Set any provider as default (moves to top of priority list)
- Disable providers they don't want to use
- Reorder providers using up/down arrows
- Enable/disable specific Ollama models

### 3. Visual Status Indicators
- **Ready**: Provider is configured and available
- **Configured**: Provider is set up but may not be available
- **Not Configured**: Provider needs setup
- **Default**: Shows which provider is the primary choice

### 4. Persistent Storage
All preferences are automatically saved to localStorage and synchronized across browser tabs.

## Usage Examples

### Setting Ollama as Default:
1. Go to Settings → Preferences tab
2. Find Ollama in the provider list
3. Click "Set Default" button
4. Ollama will be tried first for all sentiment analysis

### Disabling a Provider:
1. Toggle the switch next to any provider
2. Disabled providers are skipped entirely
3. Visual feedback shows disabled state

### Reordering Providers:
1. Use up/down arrows to change priority order
2. Higher providers are tried first
3. Changes are saved automatically

## Technical Implementation

### Service Layer (`apiPreferencesService.ts`)
- Manages preference storage and retrieval
- Provides utility functions for common operations
- Handles default fallbacks and validation

### Hook Layer (`useApiPreferences.ts`)
- React integration with automatic re-rendering
- Simplified API for components
- Cross-tab synchronization

### UI Layer (`ApiPreferencesTab.tsx`)
- Intuitive drag-and-drop style interface
- Real-time status indicators
- Integration with existing provider configuration

## Benefits

1. **User Control** - Complete customization of API behavior
2. **Reliability** - Smart fallback system prevents failures
3. **Performance** - Users can prioritize faster/preferred APIs
4. **Privacy** - Users can prefer local models (Ollama, HuggingFace)
5. **Cost Control** - Disable expensive APIs when not needed

## Future Enhancements

- Drag-and-drop reordering
- Provider performance metrics
- Custom retry logic per provider
- Advanced model filtering options