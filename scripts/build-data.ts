#!/usr/bin/env tsx

import { CSVConverter } from '../lib/data/build-scripts/convert-csv';

async function main() {
  try {
    console.log('🚀 SparFuchs Data Build Process');
    console.log('================================');
    
    const converter = new CSVConverter();
    await converter.convertAll();
    
    console.log('================================');
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();