// Application constants

export const MARKETS = {
  ALDI: 'Aldi',
  LIDL: 'Lidl',
  REWE: 'Rewe',
  EDEKA: 'Edeka',
  PENNY: 'Penny',
} as const;

export const MARKET_COLORS = {
  [MARKETS.ALDI]: '#00a8e6',
  [MARKETS.LIDL]: '#ffcc00',
  [MARKETS.REWE]: '#cc0000',
  [MARKETS.EDEKA]: '#005ca4',
  [MARKETS.PENNY]: '#ff6900',
} as const;

export const PRICE_RANGES = [
  { label: 'Unter 1€', value: '0-1', min: 0, max: 1 },
  { label: '1€ - 2€', value: '1-2', min: 1, max: 2 },
  { label: '2€ - 5€', value: '2-5', min: 2, max: 5 },
  { label: '5€ - 10€', value: '5-10', min: 5, max: 10 },
  { label: '10€ - 20€', value: '10-20', min: 10, max: 20 },
  { label: 'Über 20€', value: '20+', min: 20, max: Infinity },
] as const;

export const MAIN_CATEGORIES = [
  'Lebensmittel',
  'Getränke',
  'Drogerie',
  'Haushalt',
  'Tierbedarf',
  'Elektronik',
  'Kleidung',
  'Garten',
  'Auto',
  'Sport',
] as const;

export const SORT_OPTIONS = [
  { label: 'Preis aufsteigend', value: 'price_asc' },
  { label: 'Preis absteigend', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Kategorie', value: 'category_asc' },
  { label: 'Supermarkt', value: 'market_asc' },
] as const;

export const SEARCH_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
  AUTOCOMPLETE: 10,
} as const;

export const CHAT_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export const ERROR_MESSAGES = {
  GENERAL: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
  NETWORK: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  NOT_FOUND: 'Das gesuchte Produkt wurde nicht gefunden.',
  INVALID_INPUT: 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Eingabe.',
  API_ERROR: 'API-Fehler. Der Service ist vorübergehend nicht verfügbar.',
  TIMEOUT: 'Die Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.',
} as const;

export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: 'Suche erfolgreich abgeschlossen',
  DATA_LOADED: 'Daten erfolgreich geladen',
  FILTER_APPLIED: 'Filter wurde angewendet',
} as const;

export const LOADING_MESSAGES = [
  'Durchsuche Angebote...',
  'Vergleiche Preise...',
  'Lade Produktdaten...',
  'Analysiere Angebote...',
  'Suche beste Deals...',
] as const;