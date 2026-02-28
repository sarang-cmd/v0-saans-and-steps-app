// Custom fonts loader - checks for custom fonts in /public/fonts/
// Falls back to system defaults if custom fonts not found

export async function loadCustomFonts(): Promise<void> {
  try {
    // Check if custom font file exists
    const fontResponse = await fetch('/fonts/custom.ttf', { method: 'HEAD' });
    
    if (fontResponse.ok) {
      // Create font face for custom font
      const fontFace = new FontFace(
        'CustomFont',
        'url(/fonts/custom.ttf)',
        { style: 'normal', weight: '400' }
      );
      
      const boldFontFace = new FontFace(
        'CustomFont',
        'url(/fonts/custom-bold.ttf)',
        { style: 'normal', weight: '700' }
      );
      
      const italicFontFace = new FontFace(
        'CustomFont',
        'url(/fonts/custom-italic.ttf)',
        { style: 'italic', weight: '400' }
      );
      
      // Add to document
      document.fonts.add(fontFace);
      document.fonts.add(boldFontFace);
      document.fonts.add(italicFontFace);
      
      // Wait for fonts to load
      await Promise.all([
        fontFace.load(),
        boldFontFace.load(),
        italicFontFace.load(),
      ]).catch(() => {
        console.log('[v0] Custom fonts not fully available, using defaults');
      });
      
      // Update CSS to use custom font
      document.documentElement.style.setProperty('--font-custom', 'CustomFont, system-ui, -apple-system');
    }
  } catch (error) {
    console.log('[v0] Custom fonts not found, using defaults');
  }
}

export const customFontFamily = 'var(--font-custom, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)';
