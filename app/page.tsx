'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketToggles } from './components/UI/MarketToggles';
import { WelcomeMessages } from './components/UI/WelcomeMessages';
import { CentralInput } from './components/UI/CentralInput';
import { ShoppingListPanel } from './components/UI/ShoppingListPanel';
import { ToastContainer } from './components/UI/Toast';

import { ChatMessage } from './components/Chat/ChatMessage';
import { ChatInput } from './components/Chat/ChatInput';
import { ProductData } from './components/Chat/ProductCard';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';

import { useShoppingList } from '@/lib/hooks/useShoppingList';
import { useToast } from '@/lib/hooks/useToast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

export default function Home() {
  // Simplified state management without complex hooks
  const [selectedMarkets, setSelectedMarkets] = useState(['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe']);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Shopping List Hook
  const {
    items: shoppingListItems,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    toggleCheck,
    clearList,
    isInList,
  } = useShoppingList();

  // Toast Hook
  const { toasts, dismissToast, success, error } = useToast();

  // Animation configurations
  const springConfig = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100
  };

  // Nur beim ersten Laden animieren
  const pageTransition = {
    initial: hasInitiallyLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: springConfig
  };

  const slideFromBottom = hasInitiallyLoaded ? {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: springConfig
  };

  useEffect(() => {
    setIsClient(true);
    // Nach initialem Laden: keine Animationen mehr
    setTimeout(() => {
      setHasInitiallyLoaded(true);
    }, 1000); // Nach 1 Sekunde (wenn initiale Animation fertig ist)
  }, []);

  const handleUpdateMarkets = (newMarkets: string[]) => {
    setSelectedMarkets(newMarkets);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Nur nach User-Nachrichten scrollen (nicht nach Assistant-Antworten)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Nur bei User-Messages oder wenn gerade geladen wird
      if (lastMessage.role === 'user' || isLoading) {
        scrollToBottom();
      }
    }
  }, [messages, isLoading]);

  const handleStartChat = async (message: string) => {
    setChatStarted(true);
    await handleSendMessage(message);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          selectedMarkets: selectedMarkets,
          useSemanticSearch: true
        }),
      });

      if (!response.ok) {
        // Versuche, den Fehler vom Server zu lesen
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming data
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }
              if (data.done) {
                // Streaming beendet - Produkte können jetzt alle angezeigt werden
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                setIsLoading(false);
                return;
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorText = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';

      // Beende Streaming für alle Messages
      setMessages(prev => prev.map(msg => ({ ...msg, isStreaming: false })));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Fehler: ${errorText}\n\nBitte versuche es erneut oder stelle deine Frage anders.`,
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setChatStarted(false);
    setMessages([]);
  };

  // Shopping List Handlers
  const handleAddToList = (product: ProductData) => {
    if (isInList(product.id)) {
      const itemToRemove = shoppingListItems.find(item => item.productId === product.id);
      if (itemToRemove) {
        removeItem(itemToRemove.id);
      }
    } else {
      addItem(product);
    }
  };

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleClearList = () => {
    clearList();
  };

  const handleToggleHideCompleted = () => {
    setHideCompleted(!hideCompleted);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sparfuchs-background)' }}>
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            style={{ borderColor: 'var(--sparfuchs-primary)' }}
            role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-lg">SparFuchs lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sparfuchs-background)' }}>
      <Header
        shoppingListCount={itemCount}
        onOpenShoppingList={handleOpenPanel}
        isShoppingListOpen={isPanelOpen}
      />

      <AnimatePresence mode="wait">
        {chatStarted ? (
          <motion.div
            key="chat-interface"
            className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
            {...pageTransition}
          >

            {/* Messages Area */}
            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              {...slideFromBottom}
            >
              {messages.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--sparfuchs-text-light)' }}>
                  Stellen Sie eine Frage über Supermarkt-Angebote...
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    selectedMarkets={selectedMarkets}
                    onAddToList={handleAddToList}
                    isInList={isInList}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input Area */}
            <motion.div
              className="border-t p-4"
              style={{
                borderColor: 'var(--sparfuchs-border)',
                background: 'var(--sparfuchs-background)'
              }}
              initial={hasInitiallyLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={hasInitiallyLoaded ? { duration: 0 } : {
                type: "spring",
                damping: 20,
                stiffness: 100,
                delay: 0.2
              }}
            >
              {/* Market Toggles - über der Chateingabe */}
              <div className="mb-4">
                <MarketToggles
                  selectedMarkets={selectedMarkets}
                  onMarketChange={handleUpdateMarkets}
                />
              </div>

              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                placeholder="Wonach suchst du? (Obst, Gemüse, Preisvergleiche, etc...)"
              />

              {/* Reset Button below input */}
              <motion.div
                className="mt-3 text-center"
                initial={hasInitiallyLoaded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={hasInitiallyLoaded ? { duration: 0 } : {
                  type: "spring",
                  damping: 25,
                  stiffness: 100,
                  delay: 0.4
                }}
              >
                <motion.button
                  onClick={handleResetChat}
                  className="px-4 py-2 text-sm rounded-md border inter-font-medium"
                  style={{
                    borderColor: 'var(--sparfuchs-border)',
                    color: 'var(--sparfuchs-text)',
                    backgroundColor: 'var(--sparfuchs-surface)'
                  }}
                  whileHover={{
                    scale: 1.05,
                    borderColor: 'var(--sparfuchs-primary)',
                    color: 'var(--sparfuchs-primary)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Chat zurücksetzen
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="welcome-screen"
            className="flex-1 flex items-center justify-center"
            {...pageTransition}
          >
            <div className="max-w-2xl w-full px-6 mt-4 sm:mt-6">
              {/* Market Toggles - above input */}
              <div className="mb-6">
                <MarketToggles
                  selectedMarkets={selectedMarkets}
                  onMarketChange={handleUpdateMarkets}
                />
              </div>

              {/* Central Input */}
              <div className="mb-6">
                <CentralInput
                  onSendMessage={handleStartChat}
                  disableAnimation={hasInitiallyLoaded}
                />
              </div>

              {/* Welcome Messages - below input */}
              <div>
                <WelcomeMessages
                  onSuggestionClick={handleStartChat}
                  disableAnimation={hasInitiallyLoaded}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Shopping List Panel */}
      <ShoppingListPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        items={shoppingListItems}
        totalPrice={totalPrice}
        onToggleCheck={toggleCheck}
        onRemoveItem={removeItem}
        onClearList={handleClearList}
        hideCompleted={hideCompleted}
        onToggleHideCompleted={handleToggleHideCompleted}
        selectedMarkets={selectedMarkets}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}