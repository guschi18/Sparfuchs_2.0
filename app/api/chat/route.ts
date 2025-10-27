import { NextRequest } from 'next/server';
import { findOffers, toProductCard } from '@/lib/data/offers';
import { createChatCompletion, parseStreamingResponse } from '@/lib/ai/openrouter';
import type { ChatRequest, ProductCard } from '@/types';

// Wichtig: Node Runtime für Filesystem-Zugriff
export const runtime = 'nodejs';

// Maximalanzahl der Produkte, die dem Modell im System-Prompt übergeben werden
const MAX_PRODUCTS_FOR_PROMPT = 150;

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
5. Nutze die Felder discount_pct, uvp, notes für hilfreiche Zusatzinfos.
6. Für jedes Produkt, das du empfiehlst, gib EINE Zeile aus:
   PRODUCT_CARD: {"id":"...","name":"...","price":"...","market":"...","dateRange":"...","brand":"...","uvp":"...","discount_pct":...,"notes":"..."}

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
  try {
    // 1. Request validieren
    const body: ChatRequest = await request.json();
    const { message, selectedMarkets, useSemanticSearch = true } = body;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Nachricht darf nicht leer sein' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!selectedMarkets || selectedMarkets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Bitte wähle mindestens einen Supermarkt aus' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Angebote suchen
    let matchingProducts: ProductCard[] = [];
    try {
      matchingProducts = findOffers(validSelectedMarkets, message);
    } catch (searchError) {
      console.error('Fehler beim Suchen der Angebote:', searchError);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Laden der Angebotsdaten. Bitte versuche es erneut.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
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
      },
    });
  } catch (error) {
    console.error('Chat API Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';

    return new Response(
      JSON.stringify({ error: `Fehler beim Verarbeiten der Anfrage: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
