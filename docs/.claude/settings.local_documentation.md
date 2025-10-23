<!-- Source: .claude\settings.local.json -->
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
```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)",
      "WebFetch(domain:api.github.com)",
      "Bash(git clone:*)",
      "Bash(npx create-next-app:*)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(npm install openai csv-parse dotenv)",
      "Bash(npm install:*)",
      "Bash(cp:*)",
      "Bash(npm run:*)",
      "Bash(curl:*)",
      "Bash(npm test)",
      "Bash(sed:*)",
      "Bash(grep:*)",
      "Bash(npm test:*)",
      "Bash(timeout 30s npm run build)",
      "Bash(rm:*)",
      "Bash(npm rebuild:*)",
      "Bash(npm uninstall:*)",
      "Bash(timeout 15s npm run dev)",
      "Bash(timeout 60s npm run build)",
      "Bash(npx tailwindcss init:*)",
      "Bash(timeout 10s npm run dev)",
      "Bash(node:*)",
      "Bash(timeout 5s npm run dev)",
      "Bash(jobs)",
      "Bash(pkill:*)",
      "Bash(kill:*)",
      "Bash(true)",
      "Bash(npx next:*)",
      "Bash(git add:*)",
      "Bash(git reset:*)",
      "WebFetch(domain:www.heroui.com)",
      "Bash(git restore:*)"
    ],
    "deny": []
  }
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