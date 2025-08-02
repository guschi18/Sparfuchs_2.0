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
        className="max-w-[80%] rounded-xl px-5 py-3 shadow-sm chat-font"
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
          {parsedContent.map((part, index) => {
            if (typeof part === 'string') {
              return (
                <div key={index} className="whitespace-pre-wrap break-words mb-2">
                  {part}
                </div>
              );
            } else {
              // Render ProductCard for product data
              return (
                <div key={index} className="my-3">
                  <ProductCard product={part} />
                </div>
              );
            }
          })}
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