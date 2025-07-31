'use client';

interface MarketTogglesProps {
  selectedMarkets: string[];
  onMarketChange: (markets: string[]) => void;
}

const AVAILABLE_MARKETS = [
  { id: 'Aldi', name: 'Aldi', color: 'var(--color-market-aldi)', bgColor: 'var(--color-market-aldi)' },
  { id: 'Lidl', name: 'Lidl', color: 'var(--color-market-lidl)', bgColor: 'var(--color-market-lidl)' },
  { id: 'Rewe', name: 'Rewe', color: 'var(--color-market-rewe)', bgColor: 'var(--color-market-rewe)' },
  { id: 'Edeka', name: 'Edeka', color: 'var(--color-market-edeka)', bgColor: 'var(--color-market-edeka)' },
  { id: 'Penny', name: 'Penny', color: 'var(--color-market-penny)', bgColor: 'var(--color-market-penny)' },
];

export function MarketToggles({ selectedMarkets, onMarketChange }: MarketTogglesProps) {
  const toggleMarket = (marketId: string) => {
    if (selectedMarkets.includes(marketId)) {
      // Entfernen, wenn bereits ausgewählt (aber mindestens einer muss ausgewählt bleiben)
      if (selectedMarkets.length > 1) {
        onMarketChange(selectedMarkets.filter(id => id !== marketId));
      }
    } else {
      // Hinzufügen, wenn nicht ausgewählt
      onMarketChange([...selectedMarkets, marketId]);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {AVAILABLE_MARKETS.map((market) => {
        const isSelected = selectedMarkets.includes(market.id);
        
        return (
          <button
            key={market.id}
            onClick={() => toggleMarket(market.id)}
            className="px-4 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 border-2"
            style={{
              background: isSelected ? market.color : 'var(--sparfuchs-surface)',
              borderColor: market.color,
              color: isSelected ? 'var(--sparfuchs-text-on-dark)' : market.color,
            }}
            onMouseOver={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = market.color;
                e.currentTarget.style.color = 'var(--sparfuchs-text-on-dark)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = 'var(--sparfuchs-surface)';
                e.currentTarget.style.color = market.color;
              }
            }}
          >
            {market.name}
          </button>
        );
      })}
    </div>
  );
}