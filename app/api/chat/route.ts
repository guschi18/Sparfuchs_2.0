import { NextRequest } from 'next/server';
import { semanticSearch } from '@/lib/search/semantic';
import { createChatCompletion, parseStreamingResponse } from '@/lib/ai/openrouter';
import { logSemanticSearch } from '@/lib/search/logger';
import type { ChatRequest, ProductCard } from '@/types';

// Wichtig: Node Runtime für Filesystem-Zugriff
export const runtime = 'nodejs';

// Maximalanzahl der Produkte, die dem Modell im System-Prompt übergeben werden
const MAX_PRODUCTS_FOR_PROMPT = 150;

// CORS Headers für Mobile App Zugriff
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * OPTIONS /api/chat - CORS Preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Erstellt den System-Prompt für die KI
 */
function createSystemPrompt(selectedMarkets: string[], products: ProductCard[]): string {
  const marketList = selectedMarkets.join(', ');
  const productsJson = JSON.stringify(products, null, 2);

  return `Du bist ein hilfreicher Shopping-Assistent für SparFuchs.de, eine deutsche Preisvergleichs-App.

**WICHTIGE REGELN:**
1. Nutze AUSSCHLIESSLICH die folgenden Angebotsdaten. KEINE Produkte erfinden!
2. Nutze NUR Produkte aus folgenden Supermärkten: ${marketList}
3. Ignoriere alle anderen Supermärkte komplett!
4. Antworte in freundlichem, hilfreichem Deutsch.
5. Nutze die Felder variant, pack_size, notes für hilfreiche Zusatzinfos.
6. Für jedes Produkt, das du empfiehlst, gib EINE Zeile aus:
   PRODUCT_CARD: {"id":"...","name":"...","price":"...","market":"...","dateRange":"...","brand":"...","notes":"..."}
   - Lass optionale Felder weg, wenn keine Daten vorhanden sind.

SEMANTISCHE INTERPRETATION – SEHR WICHTIG:
1) Extrahiere 1–5 Suchbegriffe aus der Nutzerfrage (Produkt, Marke, Attribute).
2) Interpretiere Kategoriebegriffe semantisch und mappe sie auf konkrete Produkte:
   - Obst ≈ Apfel/Äpfel, Banane, Beeren, Trauben, Kiwi, Mango, Orange, Mandarine, Zitrone, Birne
   - Butter ≈ Butter, Deutsche Markenbutter, Süßrahmbutter, Rahmbutter, Kerrygold, Weihenstephan
   - Milch ≈ H-Milch, Frischmilch, Vollmilch, fettarme Milch, Bio-Milch, laktosefreie Milch
   - Gemüse ≈ Tomate, Gurke, Paprika, Salat, Karotte, Zwiebel, Kartoffel
3) Filtere NUR innerhalb der übergebenen Angebotsdaten nach diesen Begriffen.
4) Vermeide Teilstring-Fehler (z. B. "Milch" ist NICHT "Milchschokolade").
5) Bevorzuge exakte Übereinstimmungen, danach semantisch nahe Synonyme derselben Kategorie.


**VERFÜGBARE ANGEBOTE:**
${productsJson}

**ANTWORTFORMAT:**
1. Kurze hilfreiche Textantwort (z.B. "Ich habe 3 günstige Milch-Angebote gefunden:")
2. Für jedes empfohlene Produkt eine Zeile: PRODUCT_CARD: {JSON}
3. Optional: Zusätzliche Hinweise (z.B. "Achtung: Begrenzte Verfügbarkeit!")

Wenn KEINE passenden Produkte in den Daten vorhanden sind, sage freundlich, dass nichts gefunden wurde.`;
}

/**
 * POST /api/chat - Chat-Endpoint mit Streaming
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Request validieren
    const body: ChatRequest = await request.json();
    const { message, selectedMarkets } = body;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Nachricht darf nicht leer sein' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!selectedMarkets || selectedMarkets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Bitte wähle mindestens einen Supermarkt aus' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 2. Gültige Märkte filtern (nur bekannte Supermärkte)
    const VALID_MARKETS = ['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny'];
    const validSelectedMarkets = selectedMarkets.filter(m =>
      VALID_MARKETS.some(vm => vm.toLowerCase() === m.toLowerCase())
    );

    if (validSelectedMarkets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keine gültigen Supermärkte ausgewählt' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 3. Angebote suchen (Semantic Search)
    let matchingProducts: ProductCard[] = [];
    try {
      matchingProducts = await semanticSearch(message, validSelectedMarkets);

      // 🔥 LOGGING: Suchanfrage protokollieren
      const duration = Date.now() - startTime;
      logSemanticSearch({
        query: message,
        markets: validSelectedMarkets,
        resultCount: matchingProducts.length,
        latencyMs: duration,
      });

    } catch (searchError) {
      console.error('Fehler beim Suchen der Angebote:', searchError);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Laden der Angebotsdaten. Bitte versuche es erneut.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (matchingProducts.length === 0) {
      // Keine Treffer gefunden
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const noResultsMessage = `Leider habe ich keine passenden Angebote in den ausgewählten Märkten (${validSelectedMarkets.join(', ')}) gefunden. Versuche es mit anderen Suchbegriffen oder wähle mehr Supermärkte aus.`;

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: noResultsMessage })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders,
        },
      });
    }

    // 4. KI-Aufruf mit Streaming
    const limitedProductsForPrompt = matchingProducts.slice(0, MAX_PRODUCTS_FOR_PROMPT);
    const systemPrompt = createSystemPrompt(validSelectedMarkets, limitedProductsForPrompt);

    const aiResponse = await createChatCompletion({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      stream: true,
    });

    // 5. Stream zurück an Client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await parseStreamingResponse(aiResponse, (chunk) => {
            // Sende jeden Chunk als SSE
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          });

          // Abschluss-Signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Streaming-Fehler:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unbekannter Fehler';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Chat API Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';

    return new Response(
      JSON.stringify({ error: `Fehler beim Verarbeiten der Anfrage: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
