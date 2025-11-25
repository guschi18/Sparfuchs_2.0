# Walkthrough: Embedding-basierte Semantische Suche

Wir haben die alte Synonym-basierte Suche erfolgreich durch eine moderne, KI-gestützte semantische Suche ersetzt. Hier ist eine Zusammenfassung der Änderungen und wie das neue System funktioniert.

## 🚀 Was wurde erreicht?

1.  **Semantische Suche statt Keywords:**
    - Statt starrer Synonym-Listen nutzen wir jetzt **Embeddings** (Vektoren), um die *Bedeutung* einer Suchanfrage zu verstehen.
    - Eine Suche nach "Frühstück" findet jetzt automatisch Produkte wie "Müsli", "Kaffee", "Brötchen" und "Marmelade", auch wenn das Wort "Frühstück" nicht im Produktnamen vorkommt.

2.  **Architektur-Upgrade:**
    - **OpenRouter API:** Generiert Embeddings für Suchanfragen.
    - **Lokaler Vektor-Index:** `storage/embeddings/offers.v1.json` speichert die Vektoren für alle ~1600 Angebote.
    - **LRU Cache:** Speichert häufige Suchanfragen, um API-Kosten und Latenz zu minimieren.
    - **Cosine Similarity:** Eigener Algorithmus in `lib/search/cosine.ts` für extrem schnelles Ranking im Browser/Server.

3.  **Code-Cleanup:**
    - Das alte, wartungsintensive Synonym-System (`SYNONYMS` Dictionary, `scripts/Synonyms/`) wurde komplett entfernt.
    - Der Code ist jetzt sauberer und leichter zu warten.

## 🛠️ Technische Details

### Neue Dateien & Komponenten

| Datei | Funktion |
| :--- | :--- |
| `lib/search/semantic.ts` | Kern-Logik: Lädt den Index, filtert nach Märkten und führt die Vektor-Suche durch. |
| `lib/search/cosine.ts` | Mathematische Funktionen für den Vektor-Vergleich. |
| `lib/search/embedding-cache.ts` | Caching-Layer für Suchanfragen. |
| `lib/ai/embeddings.ts` | Client für die OpenRouter API. |
| `scripts/embedding/` | Scripte zum Erstellen (`build-offer-index.ts`) und Aktualisieren (`refresh-index.ts`) des Index. |

### API & UI Anpassungen

- **`app/api/chat/route.ts`:** Nutzt jetzt `semanticSearch()` statt `findOffers()`. Der System-Prompt wurde optimiert, um die semantischen Treffer besser zu nutzen.
- **`ProductCard.tsx`:** Aufgeräumt (keine UVP/Discount mehr), da diese Daten im neuen Feed nicht mehr konsistent vorhanden waren.

## 📊 Performance & Kosten

- **Index-Größe:** ~100MB (wird beim Start einmalig geladen).
- **Such-Geschwindigkeit:** < 50ms für die Vektor-Berechnung (lokal).
- **API-Kosten:** Minimal, da Embeddings sehr günstig sind und wir aggressiv cachen.

## 🔄 Nächste Schritte (Wartung)

Um den Index aktuell zu halten, sollte regelmäßig (z.B. wöchentlich oder bei neuen Angeboten) das Refresh-Script ausgeführt werden:

```bash
npm run embeddings:refresh
```

Dies aktualisiert nur die geänderten Angebote und spart Kosten.

---

**Fazit:** SparFuchs 2.0 ist jetzt deutlich "intelligenter" und bietet ein wesentlich besseres Sucherlebnis! 🦊✨
