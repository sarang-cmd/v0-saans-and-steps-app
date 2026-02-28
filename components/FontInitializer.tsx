'use client';

import { useEffect } from 'react';
import { loadCustomFonts } from '@/lib/fonts';

export function FontInitializer() {
  useEffect(() => {
    // Load custom fonts on mount if available
    loadCustomFonts().catch(() => {
      console.log('[v0] Using default fonts');
    });
  }, []);

  return null;
}
