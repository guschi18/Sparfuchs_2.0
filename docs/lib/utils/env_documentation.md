<!-- Source: .env.local -->

# Environment Variables Documentation

## Architektur & Zweck
- **Zweck**: Konfiguration der Applikation über Environment Variables
- **File**: `.env.local` (nicht im Git)

## Required Variables

### AI & Search
- **`OPENROUTER_API_KEY`**: API Key für OpenRouter (Required for Chat & Embeddings)
- **`EMBEDDING_PROVIDER`**: Provider für Embeddings (Default: `openrouter`)
- **`EMBEDDING_MODEL`**: Modell für Embeddings (Default: `text-embedding-3-large`)
- **`USE_SEMANTIC_SEARCH`**: Feature Flag für Semantische Suche (`true`/`false`)

### App Metadata
- **`NEXT_PUBLIC_APP_URL`**: URL der App (für OpenRouter Referer)
- **`NEXT_PUBLIC_APP_TITLE`**: Titel der App (für OpenRouter X-Title)

## Usage
- **Server-Side**: `process.env.VARIABLE_NAME`
- **Client-Side**: `process.env.NEXT_PUBLIC_VARIABLE_NAME`

## Security
- API Keys (`OPENROUTER_API_KEY`) dürfen NIEMALS mit `NEXT_PUBLIC_` präfixiert werden.
