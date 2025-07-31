'use client';

export function Header() {
  return (
    <header 
      className="py-6 sm:py-8"
      style={{ background: 'var(--sparfuchs-background)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* Shopping Cart Emoji */}
          <span className="text-3xl">🛒</span>
          
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: 'var(--sparfuchs-text)' }}
          >
            SparFuchs<span style={{ color: 'var(--sparfuchs-primary)' }}>.de</span>
          </h1>
        </div>
        
        <p 
          className="text-sm sm:text-base lg:text-lg"
          style={{ color: 'var(--sparfuchs-text-light)' }}
        >
          Dein KI-Assistent für Supermarkt-Angebote
        </p>
      </div>
    </header>
  );
}