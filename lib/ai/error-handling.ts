export interface ErrorResponse {
  error: string;
  code: string;
  retryable: boolean;
  fallbackMessage?: string;
}

export class AIErrorHandler {
  private static readonly FALLBACK_MESSAGES = {
    timeout: 'Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es mit einer kürzeren Anfrage.',
    rate_limit: 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
    api_error: 'Der KI-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.',
    network_error: 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    invalid_request: 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingabe.',
    quota_exceeded: 'Das Limit für API-Aufrufe wurde erreicht. Bitte versuchen Sie es später erneut.',
    model_overloaded: 'Das KI-Modell ist überlastet. Versuche es mit einem anderen Modell...',
    default: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
  };

  static handleOpenRouterError(error: any): ErrorResponse {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';

    // Timeout Fehler
    if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      return {
        error: this.FALLBACK_MESSAGES.timeout,
        code: 'TIMEOUT',
        retryable: true,
      };
    }

    // Rate Limiting
    if (errorCode === 'rate_limit_exceeded' || errorMessage.includes('rate limit')) {
      return {
        error: this.FALLBACK_MESSAGES.rate_limit,
        code: 'RATE_LIMIT',
        retryable: true,
      };
    }

    // API Quota
    if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
      return {
        error: this.FALLBACK_MESSAGES.quota_exceeded,
        code: 'QUOTA_EXCEEDED',
        retryable: false,
      };
    }

    // Model Overloaded
    if (errorMessage.includes('overloaded') || errorMessage.includes('capacity')) {
      return {
        error: this.FALLBACK_MESSAGES.model_overloaded,
        code: 'MODEL_OVERLOADED',
        retryable: true,
        fallbackMessage: 'Versuche es mit einem alternativen Modell...',
      };
    }

    // Network Fehler
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        error: this.FALLBACK_MESSAGES.network_error,
        code: 'NETWORK_ERROR',
        retryable: true,
      };
    }

    // Invalid Request
    if (errorCode === 'invalid_request_error' || errorMessage.includes('invalid')) {
      return {
        error: this.FALLBACK_MESSAGES.invalid_request,
        code: 'INVALID_REQUEST',
        retryable: false,
      };
    }

    // Default Fehlerbehandlung
    return {
      error: this.FALLBACK_MESSAGES.default,
      code: 'UNKNOWN_ERROR',
      retryable: true,
    };
  }

  static async retryWithFallback<T>(
    operation: () => Promise<T>,
    fallbackModels: string[] = ['anthropic/claude-3-5-sonnet-20241022', 'openai/gpt-4o-mini'],
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: any;

    // Ersten Versuch mit Standard-Modell
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorResponse = this.handleOpenRouterError(error);
      
      if (!errorResponse.retryable) {
        throw error;
      }
    }

    // Retry mit Fallback-Modellen
    for (let i = 0; i < Math.min(maxRetries, fallbackModels.length); i++) {
      try {
        // Retrying with fallback model
        return await operation();
      } catch (error) {
        lastError = error;
        const errorResponse = this.handleOpenRouterError(error);
        
        if (!errorResponse.retryable) {
          break;
        }
        
        // Kurze Pause zwischen Versuchen
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw lastError;
  }

  static createFallbackResponse(userQuery: string): string {
    const searchTerms = userQuery.toLowerCase();
    
    let fallbackResponse = `Entschuldigung, ich kann Ihre Anfrage zu "${userQuery}" gerade nicht verarbeiten. `;
    
    if (searchTerms.includes('aldi') || searchTerms.includes('lidl') || 
        searchTerms.includes('rewe') || searchTerms.includes('edeka') || 
        searchTerms.includes('penny')) {
      fallbackResponse += 'Bitte schauen Sie direkt in den Prospekten der jeweiligen Supermärkte nach aktuellen Angeboten.';
    } else if (searchTerms.includes('rezept') || searchTerms.includes('kochen')) {
      fallbackResponse += 'Für Rezeptideen empfehle ich Ihnen, die Suchfunktion der einzelnen Supermärkte zu nutzen.';
    } else {
      fallbackResponse += 'Bitte versuchen Sie es mit einer konkreteren Produktbezeichnung oder einem spezifischen Supermarkt.';
    }
    
    return fallbackResponse;
  }
}