/**
 * Error Classification and Recovery Strategies
 */
import { logger } from './logger';
import { ApiProvider } from '@/services/apiPreferencesService';

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  INVALID_RESPONSE = 'invalid_response',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

export enum RecoveryStrategy {
  RETRY_SAME_PROVIDER = 'retry_same_provider',
  SWITCH_PROVIDER = 'switch_provider',
  FALLBACK_LOCAL = 'fallback_local',
  USER_ACTION_REQUIRED = 'user_action_required',
  WAIT_AND_RETRY = 'wait_and_retry',
  NO_RECOVERY = 'no_recovery'
}

export interface ClassifiedError {
  type: ErrorType;
  originalError: Error;
  provider: ApiProvider;
  isRetryable: boolean;
  recoveryStrategy: RecoveryStrategy;
  userMessage: string;
  technicalMessage: string;
  suggestedActions: string[];
  retryDelay?: number;
}

export class ErrorClassifier {
  private static readonly NETWORK_ERROR_PATTERNS = [
    /network/i,
    /fetch/i,
    /connection/i,
    /timeout/i,
    /aborted/i,
    /offline/i,
    /dns/i,
    /unreachable/i
  ];

  private static readonly AUTH_ERROR_PATTERNS = [
    /unauthorized/i,
    /authentication/i,
    /api.?key/i,
    /invalid.?key/i,
    /forbidden/i,
    /401/,
    /403/
  ];

  private static readonly RATE_LIMIT_PATTERNS = [
    /rate.?limit/i,
    /too.?many.?requests/i,
    /quota/i,
    /429/,
    /throttle/i
  ];

  private static readonly SERVER_ERROR_PATTERNS = [
    /500/,
    /502/,
    /503/,
    /504/,
    /internal.?server/i,
    /bad.?gateway/i,
    /service.?unavailable/i,
    /gateway.?timeout/i
  ];

  public static classify(error: Error, provider: ApiProvider): ClassifiedError {
    const errorMessage = error.message.toLowerCase();
    const errorType = this.determineErrorType(error, errorMessage);
    const recoveryStrategy = this.determineRecoveryStrategy(errorType, provider);
    
    return {
      type: errorType,
      originalError: error,
      provider,
      isRetryable: this.isRetryable(errorType),
      recoveryStrategy,
      userMessage: this.generateUserMessage(errorType, provider),
      technicalMessage: error.message,
      suggestedActions: this.generateSuggestedActions(errorType, provider, recoveryStrategy),
      retryDelay: this.getRetryDelay(errorType)
    };
  }

  private static determineErrorType(error: Error, errorMessage: string): ErrorType {
    // Check for timeout specifically
    if (error.name === 'AbortError' || errorMessage.includes('aborted')) {
      return ErrorType.TIMEOUT;
    }

    // Check patterns in order of specificity
    if (this.matchesPatterns(errorMessage, this.AUTH_ERROR_PATTERNS)) {
      return ErrorType.AUTHENTICATION;
    }

    if (this.matchesPatterns(errorMessage, this.RATE_LIMIT_PATTERNS)) {
      return ErrorType.RATE_LIMIT;
    }

    if (this.matchesPatterns(errorMessage, this.SERVER_ERROR_PATTERNS)) {
      return ErrorType.SERVER_ERROR;
    }

    if (this.matchesPatterns(errorMessage, this.NETWORK_ERROR_PATTERNS)) {
      return ErrorType.NETWORK;
    }

    // Check for JSON parsing or invalid response errors
    if (errorMessage.includes('json') || errorMessage.includes('parse') || 
        errorMessage.includes('invalid response')) {
      return ErrorType.INVALID_RESPONSE;
    }

    // Check for configuration errors
    if (errorMessage.includes('not configured') || errorMessage.includes('missing') ||
        errorMessage.includes('invalid config')) {
      return ErrorType.CONFIGURATION;
    }

    return ErrorType.UNKNOWN;
  }

  private static matchesPatterns(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  private static determineRecoveryStrategy(errorType: ErrorType, provider: ApiProvider): RecoveryStrategy {
    switch (errorType) {
      case ErrorType.NETWORK:
      case ErrorType.TIMEOUT:
        return this.isNetworkDependent(provider) ? RecoveryStrategy.FALLBACK_LOCAL : RecoveryStrategy.RETRY_SAME_PROVIDER;
      
      case ErrorType.AUTHENTICATION:
      case ErrorType.CONFIGURATION:
        return RecoveryStrategy.USER_ACTION_REQUIRED;
      
      case ErrorType.RATE_LIMIT:
        return RecoveryStrategy.WAIT_AND_RETRY;
      
      case ErrorType.SERVER_ERROR:
        return RecoveryStrategy.SWITCH_PROVIDER;
      
      case ErrorType.INVALID_RESPONSE:
        return RecoveryStrategy.RETRY_SAME_PROVIDER;
      
      default:
        return RecoveryStrategy.SWITCH_PROVIDER;
    }
  }

  private static isRetryable(errorType: ErrorType): boolean {
    return ![ErrorType.AUTHENTICATION, ErrorType.CONFIGURATION].includes(errorType);
  }

  private static generateUserMessage(errorType: ErrorType, provider: ApiProvider): string {
    const providerName = this.getProviderDisplayName(provider);
    
    switch (errorType) {
      case ErrorType.NETWORK:
        return `Unable to connect to ${providerName}. Checking for alternative providers...`;
      
      case ErrorType.TIMEOUT:
        return `${providerName} is taking too long to respond. Trying alternative providers...`;
      
      case ErrorType.AUTHENTICATION:
        return `${providerName} authentication failed. Please check your API key in Settings.`;
      
      case ErrorType.RATE_LIMIT:
        return `${providerName} rate limit reached. Waiting before retry or switching providers...`;
      
      case ErrorType.SERVER_ERROR:
        return `${providerName} is experiencing issues. Switching to alternative provider...`;
      
      case ErrorType.INVALID_RESPONSE:
        return `${providerName} returned an unexpected response. Retrying...`;
      
      case ErrorType.CONFIGURATION:
        return `${providerName} is not properly configured. Please check Settings.`;
      
      default:
        return `${providerName} encountered an error. Trying alternative providers...`;
    }
  }

  private static generateSuggestedActions(
    errorType: ErrorType, 
    provider: ApiProvider, 
    strategy: RecoveryStrategy
  ): string[] {
    const actions: string[] = [];
    const providerName = this.getProviderDisplayName(provider);

    switch (errorType) {
      case ErrorType.NETWORK:
        actions.push('Check your internet connection');
        actions.push('Try using a local AI model (Ollama) for offline analysis');
        if (this.isNetworkDependent(provider)) {
          actions.push('Enable offline mode in Settings');
        }
        break;

      case ErrorType.AUTHENTICATION:
        actions.push(`Verify your ${providerName} API key in Settings`);
        actions.push('Ensure the API key has the correct permissions');
        actions.push('Try regenerating your API key');
        break;

      case ErrorType.RATE_LIMIT:
        actions.push('Wait a few minutes before trying again');
        actions.push('Consider upgrading your API plan');
        actions.push('Enable multiple providers for automatic fallback');
        break;

      case ErrorType.SERVER_ERROR:
        actions.push(`Check ${providerName} service status`);
        actions.push('Try again in a few minutes');
        actions.push('Enable backup providers in Settings');
        break;

      case ErrorType.TIMEOUT:
        actions.push('Increase timeout settings in Advanced Settings');
        actions.push('Check your internet connection speed');
        actions.push('Try a different provider');
        break;

      case ErrorType.CONFIGURATION:
        actions.push(`Complete ${providerName} setup in Settings`);
        actions.push('Verify all required configuration fields');
        actions.push('Test the connection after configuration');
        break;

      default:
        actions.push('Try refreshing the page');
        actions.push('Check Settings for provider configuration');
        actions.push('Contact support if the issue persists');
    }

    return actions;
  }

  private static getRetryDelay(errorType: ErrorType): number | undefined {
    switch (errorType) {
      case ErrorType.RATE_LIMIT:
        return 60000; // 1 minute
      case ErrorType.SERVER_ERROR:
        return 30000; // 30 seconds
      case ErrorType.NETWORK:
      case ErrorType.TIMEOUT:
        return 5000; // 5 seconds
      default:
        return undefined;
    }
  }

  private static isNetworkDependent(provider: ApiProvider): boolean {
    return ['gemini', 'sentiment-api'].includes(provider);
  }

  private static getProviderDisplayName(provider: ApiProvider): string {
    const names: Record<ApiProvider, string> = {
      'gemini': 'Google Gemini',
      'ollama': 'Ollama',
      'huggingface': 'HuggingFace',
      'sentiment-api': 'Sentiment API'
    };
    return names[provider] || provider;
  }

  // Helper method to create a user-friendly error summary
  public static createErrorSummary(classifiedErrors: ClassifiedError[]): string {
    if (classifiedErrors.length === 0) return 'No errors to report';
    if (classifiedErrors.length === 1) return classifiedErrors[0].userMessage;

    const errorTypes = [...new Set(classifiedErrors.map(e => e.type))];
    const providers = [...new Set(classifiedErrors.map(e => e.provider))];

    if (errorTypes.includes(ErrorType.NETWORK)) {
      return 'Network connectivity issues detected. Switching to offline-capable providers...';
    }

    if (errorTypes.includes(ErrorType.AUTHENTICATION)) {
      return `Authentication issues with ${providers.length} provider(s). Please check your API keys in Settings.`;
    }

    return `Multiple providers encountered issues. Attempting automatic recovery...`;
  }
}