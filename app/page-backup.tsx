'use client';

import { useState, useEffect } from 'react';
import { ChatContainer } from './components/Chat/ChatContainer';
import { MarketToggles } from './components/UI/MarketToggles';
import { WelcomeMessages } from './components/UI/WelcomeMessages';
import { CentralInput } from './components/UI/CentralInput';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { useSessionState } from '../lib/hooks/useSessionState';

export default function Home() {
  const {
    sessionState,
    isLoaded,
    updateSelectedMarkets,
    startChat,
    resetChat,
  } = useSessionState();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) {
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
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 p-6 streamlit-sidebar">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--sparfuchs-text)' }}>
              🏪 Märkte auswählen
            </h2>
            <MarketToggles 
              selectedMarkets={sessionState.selectedMarkets}
              onMarketChange={updateSelectedMarkets}
            />
          </div>
          
          {!sessionState.chatStarted && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--sparfuchs-text)' }}>
                💡 Beispiele
              </h2>
              <WelcomeMessages onSuggestionClick={startChat} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {sessionState.chatStarted ? (
            <ChatContainer 
              selectedMarkets={sessionState.selectedMarkets}
              sessionId={sessionState.sessionId || 'default'}
              onResetChat={resetChat}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-2xl w-full px-6">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--sparfuchs-text)' }}>
                    🦊 SparFuchs
                  </h1>
                  <p className="text-xl mb-6" style={{ color: 'var(--sparfuchs-text-light)' }}>
                    Ihre KI-gestützte Supermarkt-Angebotssuchmaschine
                  </p>
                </div>
                
                <CentralInput 
                  onSendMessage={startChat}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}