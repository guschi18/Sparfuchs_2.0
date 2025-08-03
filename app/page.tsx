'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketToggles } from './components/UI/MarketToggles';
import { WelcomeMessages } from './components/UI/WelcomeMessages';
import { CentralInput } from './components/UI/CentralInput';

import { ChatMessage } from './components/Chat/ChatMessage';
import { ChatInput } from './components/Chat/ChatInput';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Home() {
  // Simplified state management without complex hooks
  const [selectedMarkets, setSelectedMarkets] = useState(['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny']);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Animation configurations
  const springConfig = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100
  };

  const pageTransition = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: springConfig
  };

  const slideFromBottom = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: springConfig
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUpdateMarkets = (newMarkets: string[]) => {
    setSelectedMarkets(newMarkets);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        timestamp: new Date()
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
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.',
        role: 'assistant',
        timestamp: new Date()
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
      <Header />
      
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
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ background: 'var(--sparfuchs-surface)' }}>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span className="inter-font" style={{ color: 'var(--sparfuchs-text)' }}>Suchen nach Angeboten...</span>
                </div>
              </div>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
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
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
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
              />
            </div>
            
            {/* Welcome Messages - below input */}
            <div>
              <WelcomeMessages onSuggestionClick={handleStartChat} />
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}