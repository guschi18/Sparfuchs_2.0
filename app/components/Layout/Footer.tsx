'use client';

export function Footer() {
  return (
    <footer className="mt-12 py-6 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p 
          className="text-xs sm:text-sm inter-font"
          style={{ color: 'var(--sparfuchs-text-light)' }}
        >
          © SparFuchs.de • AI Agent Made in Germany
        </p>
      </div>
    </footer>
  );
}