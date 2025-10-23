<!-- Source: Prompts\Docs anpassen.md -->
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
```markdown
<role>
Sie sind ein Senior Technical Writer und Documentation Maintenance Specialist mit 10+ Jahren Erfahrung in der präzisen Aktualisierung technischer Dokumentation. Sie spezialisieren sich auf Delta-Analysen und minimale, aber vollständige Updates für AI-optimierte Codedokumentation.
</role>

<task>
Analysieren Sie die Änderungen zwischen der bestehenden Code-Version und der neuen Code-Version. Aktualisieren Sie die bestehende Dokumentation gezielt und minimal - fügen Sie nur hinzu, entfernen oder ändern Sie nur das, was durch die Code-Änderungen notwendig geworden ist.
</task>

<existing_documentation>
{{CURRENT_DOCUMENTATION_CONTENT}}
</existing_documentation>

<updated_code>
{{NEW_CODE_VERSION}}
</updated_code>

<analysis_framework>
1. **Delta-Analyse durchführen**: Identifizieren Sie spezifische Änderungen zwischen alter und neuer Code-Version
2. **Impact-Assessment**: Bestimmen Sie, welche Dokumentationsbereiche betroffen sind
3. **Preservation-Check**: Identifizieren Sie Dokumentationsteile, die unverändert bleiben können
4. **Targeted Updates**: Aktualisieren Sie nur die notwendigen Abschnitte
5. **Consistency-Validation**: Stellen Sie sicher, dass die gesamte Dokumentation nach dem Update konsistent ist
</analysis_framework>

<update_guidelines>
**PRESERVE (Beibehalten):**
- Unveränderte Architekturentscheidungen
- Noch relevante Dependencies
- Bestehende Datenstrukturen (wenn unverändert)
- Gültige Performance-Notizen
- Konsistente Formatierung und Struktur

**UPDATE (Aktualisieren):**
- Geänderte Funktionssignaturen
- Neue oder entfernte Dependencies
- Modifizierte Datenstrukturen
- Geänderte Business Logic
- Neue Error Handling Patterns
- Performance-Auswirkungen durch Änderungen

**ADD (Hinzufügen):**
- Neue Funktionen oder Methoden
- Zusätzliche Dependencies
- Neue Interfaces oder Types
- Erweiterte Error Cases
- Neue Performance Considerations

**REMOVE (Entfernen):**
- Veraltete Funktionen
- Nicht mehr verwendete Dependencies
- Entfernte Datenstrukturen
- Obsolete Business Logic
- Nicht mehr relevante Performance-Notizen
</update_guidelines>

<instructions>
Führen Sie folgende Schritte systematisch aus:

1. **Change Detection**: Vergleichen Sie den neuen Code mit der bestehenden Dokumentation
2. **Section-by-Section Analysis**: Gehen Sie jeden Dokumentationsabschnitt durch und prüfen Sie Relevanz
3. **Minimal Updates**: Nehmen Sie nur die minimal notwendigen Änderungen vor
4. **Consistency Check**: Stellen Sie sicher, dass alle Referenzen und Verlinkungen noch stimmen
5. **Kompaktheit beibehalten**: Halten Sie sich an das Prinzip "so wenig wie möglich, so viel wie nötig"
</instructions>

<output_structure>
Strukturieren Sie Ihre Antwort folgendermaßen:

<change_analysis>
**Identifizierte Änderungen:**
- {{SPECIFIC_CODE_CHANGES}}

**Betroffene Dokumentationsbereiche:**
- {{AFFECTED_SECTIONS}}

**Erhaltene Bereiche:**
- {{PRESERVED_SECTIONS}}
</change_analysis>

<updated_documentation>
# {{MODULE_NAME}} Documentation

[Aktualisierte Dokumentation mit minimalen, gezielten Änderungen]

## Architektur & Zweck
{{UPDATED_OR_PRESERVED_ARCHITECTURE}}

## Dependencies & Integration
{{UPDATED_OR_PRESERVED_DEPENDENCIES}}

## Kritische Datenstrukturen
{{UPDATED_OR_PRESERVED_DATA_STRUCTURES}}

## Geschäftslogik
{{UPDATED_OR_PRESERVED_BUSINESS_LOGIC}}

## Error Handling
{{UPDATED_OR_PRESERVED_ERROR_HANDLING}}

## Performance Considerations
{{UPDATED_OR_PRESERVED_PERFORMANCE}}
</updated_documentation>

<update_summary>
**Durchgeführte Änderungen:**
- {{LIST_OF_SPECIFIC_CHANGES}}

**Unverändert geblieben:**
- {{LIST_OF_PRESERVED_CONTENT}}

**Grund für Änderungen:**
- {{JUSTIFICATION_FOR_EACH_CHANGE}}
</update_summary>
</output_structure>

<examples>
<example>
<change_type>Neue Methode hinzugefügt</change_type>
<code_change>
// Neu hinzugefügt:
async validatePayment(transactionId: string): Promise<ValidationResult> {
  // Implementation...
}
</code_change>
<documentation_update>
**Vorher:**
## Geschäftslogik
- Zahlungsflow: Token-basierte Zahlungsverarbeitung mit async/await Pattern

**Nachher:**
## Geschäftslogik
- Zahlungsflow: Token-basierte Zahlungsverarbeitung mit async/await Pattern
- Validierungsflow: Post-Payment-Validierung über Transaction-ID
</documentation_update>
</example>

<example>
<change_type>Interface erweitert</change_type>
<code_change>
// Erweitert:
interface PaymentResult {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string; // NEU
  fees: number;     // NEU
}
</code_change>
<documentation_update>
**Aktualisierung:**
```typescript
interface PaymentResult {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string; // ISO 4217 Currency Code
  fees: number;     // Processing fees in base currency units
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