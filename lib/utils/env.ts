// Environment variables utility

export const env = {
  // OpenRouter Configuration
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  
  // Public App Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || 'SparFuchs.de',
  
  // Development
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // Computed values
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL,
} as const;

// Validation function
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!env.OPENROUTER_API_KEY) {
    errors.push('OPENROUTER_API_KEY is required');
  }
  
  if (!env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is required');
  }
  
  try {
    new URL(env.NEXT_PUBLIC_APP_URL);
  } catch {
    errors.push('NEXT_PUBLIC_APP_URL must be a valid URL');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// OpenRouter configuration object
export const openRouterConfig = {
  apiKey: env.OPENROUTER_API_KEY,
  baseUrl: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
    'X-Title': env.NEXT_PUBLIC_APP_TITLE,
  },
} as const;