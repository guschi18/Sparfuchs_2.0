'use client';

interface WelcomeMessagesProps {
  onSuggestionClick: (suggestion: string) => void;
}

const WELCOME_SUGGESTIONS = [
  'Welche Milch ist diese Woche günstig?',
  'Zeige mir Angebote für Brot bei Aldi',
  'Günstige Zutaten für Spaghetti Bolognese',
  'Was kostet Butter bei Lidl?',
  'Aktuelle Fleisch-Angebote bei Rewe',
  'Günstige Obst und Gemüse Angebote'
];


export function WelcomeMessages({ onSuggestionClick }: WelcomeMessagesProps) {
  return (
    <div className="text-center space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h3 
          className="text-lg sm:text-xl font-semibold flex items-center justify-center gap-2"
          style={{ color: 'var(--sparfuchs-text)' }}
        >
          👋 Willkommen! Hier sind einige Vorschläge:
        </h3>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {WELCOME_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-xs sm:text-sm hover:shadow-md"
              style={{
                background: 'var(--sparfuchs-surface)',
                borderColor: 'var(--sparfuchs-border)',
                color: 'var(--sparfuchs-text)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--sparfuchs-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--sparfuchs-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Icon für verschiedene Kategorien */}
              {index === 0 && <span className="mr-2">🔍</span>}
              {index === 1 && <span className="mr-2">🍎</span>}
              {suggestion}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export function QuickSuggestions({ 
  suggestions, 
  onSuggestionClick 
}: { 
  suggestions: string[]; 
  onSuggestionClick: (suggestion: string) => void; 
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-xs transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}