import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'webapp';
}

export function StructuredData({ type = 'webapp' }: StructuredDataProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SparFuchs.de",
    "description": "KI-gestützte Supermarkt-Angebots-Suchmaschine für Deutschland",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://sparfuchs.vercel.app",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires modern browser with JavaScript enabled",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "KI-gestützte Produktsuche",
      "Preisvergleich zwischen Supermärkten",
      "Rezept-Integration",
      "Real-time Angebote"
    ],
    "applicationSubCategory": "Price Comparison",
    "creator": {
      "@type": "Organization",
      "name": "SparFuchs Team"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "Deutschland"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://sparfuchs.vercel.app"}?q={search_term_string}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SparFuchs",
    "description": "Intelligente Supermarkt-Angebots-Plattform",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://sparfuchs.vercel.app",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": "German"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Welche Supermärkte werden unterstützt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SparFuchs unterstützt die größten deutschen Supermarkt-Ketten: Aldi, Lidl, Rewe, Edeka und Penny."
        }
      },
      {
        "@type": "Question",
        "name": "Wie funktioniert die KI-Suche?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unsere KI analysiert natürliche Sprache und findet passende Produkte basierend auf aktuellen Angeboten und Preisen."
        }
      },
      {
        "@type": "Question",
        "name": "Ist SparFuchs kostenlos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, SparFuchs ist vollständig kostenlos nutzbar. Keine versteckten Kosten oder Premium-Features."
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}