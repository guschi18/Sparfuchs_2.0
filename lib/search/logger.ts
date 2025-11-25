import fs from 'fs';
import path from 'path';

interface SemanticSearchLogEntry {
    timestamp: string;
    query: string;
    markets: string[];
    resultCount: number;
    latencyMs: number;
    topScore?: number;
}

export function logSemanticSearch(entry: Omit<SemanticSearchLogEntry, 'timestamp'>) {
    try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, 'semantic-search.jsonl');

        const fullEntry: SemanticSearchLogEntry = {
            timestamp: new Date().toISOString(),
            ...entry,
        };

        fs.appendFileSync(logFile, JSON.stringify(fullEntry) + '\n');
    } catch (error) {
        console.error('❌ Failed to log semantic search:', error);
    }
}
