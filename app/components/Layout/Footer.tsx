'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-12 py-6 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-1 text-xs sm:text-sm inter-font flex-wrap">
          <span style={{ color: 'var(--sparfuchs-text-light)' }}>
            © SparFuchs.de • AI Agent Made in Germany • Powered by
          </span>
          <Link 
            href="https://www.hansp.de" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="/hansp-logo.png"
              alt="HansP Logo"
              width={12}
              height={12}
              className="w-3 h-3 sm:w-4 sm:h-4 inline-block rounded-full"
            />
            <span style={{ color: 'var(--sparfuchs-text-light)' }}>HansP</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}