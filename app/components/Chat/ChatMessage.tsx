'use client';

import { Message } from './ChatContainer';
import { ProductCard, ProductData } from './ProductCard';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse message content for product cards with real-time JSON hiding
  const parseMessageContent = (content: string) => {
    const parts: (string | ProductData)[] = [];
    
    // Split content into lines for processing
    const lines = content.split('\n');
    let currentTextBuffer = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line starts with PRODUCT_CARD:
      if (line.startsWith('PRODUCT_CARD: ')) {
        // Add any accumulated text before this card
        if (currentTextBuffer.trim()) {
          parts.push(currentTextBuffer.trim());
          currentTextBuffer = '';
        }
        
        try {
          // Extract JSON part
          const jsonString = line.substring('PRODUCT_CARD: '.length);
          const productData: ProductData = JSON.parse(jsonString);
          parts.push(productData);
        } catch (error) {
          // If JSON parsing fails, it might be incomplete during streaming
          // Check if it looks like an incomplete JSON
          const jsonPart = line.substring('PRODUCT_CARD: '.length);
          if (jsonPart.trim() && !jsonPart.includes('}')) {
            // Incomplete JSON - don't show it, just skip for now
            continue;
          } else {
            // Complete but invalid JSON - show as text
            currentTextBuffer += line + '\n';
          }
        }
      } else {
        // Regular text line
        currentTextBuffer += line + '\n';
      }
    }
    
    // Add any remaining text
    if (currentTextBuffer.trim()) {
      parts.push(currentTextBuffer.trim());
    }

    // If no parts found, return original content
    if (parts.length === 0) {
      // Hide incomplete PRODUCT_CARD JSON during streaming
      if (content.includes('PRODUCT_CARD: ') && !content.includes('"}')) {
        // Incomplete JSON being streamed - show loading placeholder
        parts.push('🔄 Lade Produktinformationen...');
      } else {
        parts.push(content);
      }
    }

    return parts;
  };

  const parsedContent = parseMessageContent(message.content);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`${isUser ? 'max-w-[80%]' : 'max-w-[95%]'} rounded-xl px-5 py-3 shadow-sm chat-font`}
        style={{
          background: isUser
            ? 'rgba(255, 107, 53, 0.9)'
            : 'var(--sparfuchs-surface)',
          border: isUser
            ? 'none'
            : '1px solid var(--sparfuchs-border)',
          color: 'var(--sparfuchs-text)'
        }}
      >
        {/* Render parsed content */}
        <div className="leading-relaxed">
          {(() => {
            const groupedContent: JSX.Element[] = [];
            let productBuffer: ProductData[] = [];

            const flushProductBuffer = (key: number) => {
              if (productBuffer.length > 0) {
                // Group products by market
                const productsByMarket: { [market: string]: ProductData[] } = {};
                productBuffer.forEach((product) => {
                  if (!productsByMarket[product.market]) {
                    productsByMarket[product.market] = [];
                  }
                  productsByMarket[product.market].push(product);
                });

                // Render each market group separately
                Object.entries(productsByMarket).forEach(([market, products], marketIdx) => {
                  groupedContent.push(
                    <div key={`market-${key}-${marketIdx}`} className="my-4">
                      <h3 className="text-lg font-semibold mb-3 pb-2 text-gray-700 border-b-2 border-gray-300">{market}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product, idx) => (
                          <ProductCard key={`product-${key}-${marketIdx}-${idx}`} product={product} />
                        ))}
                      </div>
                    </div>
                  );
                });

                productBuffer = [];
              }
            };

            parsedContent.forEach((part, index) => {
              if (typeof part === 'string') {
                // Flush any accumulated products before text
                flushProductBuffer(index);
                groupedContent.push(
                  <div key={`text-${index}`} className="whitespace-pre-wrap break-words mb-2">
                    {part}
                  </div>
                );
              } else {
                // Accumulate product cards
                productBuffer.push(part);
              }
            });

            // Flush any remaining products
            flushProductBuffer(parsedContent.length);

            return groupedContent;
          })()}
        </div>
        
        <div 
          className="text-xs mt-2"
          style={{ 
            color: 'var(--sparfuchs-text-light)'
          }}
        >
          {message.timestamp.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}