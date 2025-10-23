<!-- Source: app\globals.css -->
<role>
Sie sind ein Senior Technical Writer bei einem Fortune-500-Technologieunternehmen mit 10+ Jahren Erfahrung in der Erstellung entwicklerfokussierter API-Dokumentation. Sie spezialisieren sich auf präzise, AI-optimierte Codedokumentation, die technische Genauigkeit mit Zugänglichkeit für Entwickler verschiedener Erfahrungsstufen balanciert.
</role>

<project_context>
Analysieren Sie das folgende Code-File systematisch für optimales AI-Verständnis in zukünftigen Sessions. Diese Dokumentation wird von Claude Code und anderen AI-Systemen gelesen, um Projektkontext zu verstehen und bei der Weiterentwicklung zu helfen.
</project_context>

<instructions>
Erstellen Sie eine strategisch fokussierte Markdown-Dokumentation, die folgende Analyseschritte befolgt:

1. **Architektur & Zweck identifizieren**: Bestimmen Sie die Kernfunktion, verwendete Designpatterns und kritische Architekturentscheidungen
2. **Dependencies & Integration dokumentieren**: Erfassen Sie externe Abhängigkeiten und Integrationen mit anderen Modulen
3. **Kritische Datenstrukturen extrahieren**: Dokumentieren Sie wichtige Interfaces, Types, Klassen und deren Beziehungen
4. **Geschäftslogik analysieren**: Extrahieren Sie Kerngeschäftslogik, kritische Algorithmen und Entscheidungslogik
5. **Error Handling & Edge Cases**: Dokumentieren Sie Fehlerbehandlung und wichtige Randfälle
6. **Performance-relevante Aspekte**: Notieren Sie Optimierungen, potenzielle Bottlenecks und Skalierungsüberlegungen

Fokussieren Sie auf Informationen, die für AI-Verständnis und Code-Maintenance kritisch sind. Lassen Sie offensichtliche oder triviale Details weg.
</instructions>

<code>
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* SparFuchs Brand Colors - Original Streamlit Palette */
:root {
  --sparfuchs-primary: #ff6b35;     /* Orange - Buttons, Links, Akzente */
  --sparfuchs-secondary: #FF6600;   /* Original Orange - Dunkle Flächen, Header */
  --sparfuchs-accent: #E0E0E0;      /* Helles Grau - Helle Flächen, Cards */
  --sparfuchs-background: #E8E0D0;  /* Original Beige/Creme Background */
  --sparfuchs-surface: #FFFFFF;     /* Weiß Surface für Cards */
  --sparfuchs-text: #2A2A2A;        /* Original Dunkelgrau für Text */
  --sparfuchs-text-light: #666666;  /* Mittelgrau für sekundären Text */
  --sparfuchs-text-on-dark: #FFFFFF; /* Weiß auf dunklem Grund */
  --sparfuchs-border: #E0E0E0;      /* Helles Grau für Borders */
  --sparfuchs-success: #28A745;     /* Original Grün für Erfolg */
  --sparfuchs-warning: #FFC107;     /* Gelb für Warnings */
  --sparfuchs-error: #DC3545;       /* Rot für Fehler */
  
  /* Market Colors - Einheitliches Grün */
  --color-market-aldi: #28A745;
  --color-market-lidl: #28A745;
  --color-market-rewe: #28A745;
  --color-market-edeka: #28A745;
  --color-market-penny: #28A745;
}

body {
  background: var(--sparfuchs-background);
  color: var(--sparfuchs-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
}

/* Inter font styling classes */
.chat-font, .inter-font {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

.chat-font-medium, .inter-font-medium {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  line-height: 1.5;
}

.inter-font-semibold {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 1.4;
}

/* Streamlit-inspired styling */
.streamlit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.streamlit-sidebar {
  background: var(--sparfuchs-surface);
  border-right: 1px solid var(--sparfuchs-border);
  min-height: 100vh;
}

.streamlit-main {
  background: var(--sparfuchs-surface);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .streamlit-container {
    padding: 0.5rem;
  }
  
  .streamlit-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--sparfuchs-border);
    min-height: auto;
  }
  
  .streamlit-main {
    border-radius: 0.5rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .streamlit-container {
    padding: 0.25rem;
  }
  
  .streamlit-main {
    border-radius: 0.25rem;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--sparfuchs-border);
}

::-webkit-scrollbar-thumb {
  background: var(--sparfuchs-text-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--sparfuchs-secondary);
}

```
</code>

<examples>
<example>
<input_code>
export class PaymentProcessor {
  constructor(private apiKey: string, private environment: 'sandbox' | 'production') {}
  
  async processPayment(amount: number, token: string): Promise<PaymentResult> {
    const endpoint = this.environment === 'sandbox' 
      ? 'https://api-sandbox.payments.com/v1/charge'
      : 'https://api.payments.com/v1/charge';
    // Implementation details...
  }
}
</input_code>

<expected_documentation>
# PaymentProcessor Documentation

## Architektur & Zweck
**Zweck**: Zentraler Service für Zahlungsabwicklung mit Sandbox/Production-Umgebungsunterstützung
**Pattern**: Service-Klasse mit Dependency Injection für API-Konfiguration
**Kritische Entscheidung**: Umgebungsbasierte Endpoint-Auswahl zur Laufzeit

## Dependencies & Integration
- **Externe API**: payments.com REST API (v1)
- **Umgebungen**: Sandbox (`api-sandbox.payments.com`) und Production (`api.payments.com`)
- **Authentifizierung**: API-Key-basiert über Constructor-Injection

## Kritische Datenstrukturen
```typescript
interface PaymentResult {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
}

Schreibe so wenig Dokumentation wie möglich und halte dich kurz und knapp 

Dateiname: `docs/[FOLDER_NAME]/[MODULE_NAME]_documentation.md` erstellen. 