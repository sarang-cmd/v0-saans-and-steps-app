# Custom Fonts Directory

This directory is for custom font files that will be loaded if present. The app automatically falls back to system defaults if no custom fonts are found.

## Supported Font Files

To use custom fonts, add the following files to this directory:

### Required Files

- `custom.ttf` - Regular weight font (normal style)
- `custom-bold.ttf` - Bold weight font (700 weight)
- `custom-italic.ttf` - Italic style font

### Optional Files

- `custom-300.ttf` - Light weight
- `custom-600.ttf` - Semi-bold weight
- `custom-900.ttf` - Black weight

## Installation Steps

1. **Add Your Font Files**
   - Download or create your font files in TTF, OTF, or WOFF2 format
   - Place `custom.ttf`, `custom-bold.ttf`, and `custom-italic.ttf` in this directory

2. **Automatic Loading**
   - The app automatically detects and loads custom fonts on startup
   - If fonts are not found, it falls back to system defaults (Geist on desktop, system fonts on mobile)

3. **CSS Integration**
   - Custom fonts are automatically integrated into the `--font-custom` CSS variable
   - Used throughout the app via `font-sans` Tailwind class

## Example Font Recommendations

**Indian-Inspired Fonts:**
- **Noto Sans** - Great for bilingual support
- **Inter** - Modern, minimal
- **Poppins** - Geometric, friendly
- **Outfit** - Contemporary, clean

**Premium Fonts (Commercial):**
- **SF Pro Display** - Apple's system font
- **Montserrat** - Professional
- **Raleway** - Elegant

## Font File Formats

- **TTF** (.ttf) - TrueType Format - Most compatible
- **OTF** (.otf) - OpenType Format - Professional quality
- **WOFF2** (.woff2) - Web-optimized, smallest file size
- **WOFF** (.woff) - Legacy web format

## Performance Tips

1. Use WOFF2 format for fastest loading
2. Subset fonts to include only used characters
3. Use variable fonts to reduce file count
4. Compress files with FontSquirrel or similar tools

## Fallback Font Stack

If custom fonts are not available, the app uses this stack:

```
CustomFont, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

## Bilingual Support

The app supports both English and Hindi. Ensure your custom font includes:
- Latin characters (A-Z, a-z, 0-9)
- Devanagari characters (for Hindi support)
- Common punctuation marks

## Testing Custom Fonts

1. Add your font files to this directory
2. Restart the development server
3. Check browser console for font loading messages
4. Font should automatically apply throughout the app

---

For more information about font files and licensing, visit:
- https://fonts.google.com/
- https://www.fontsquirrel.com/
- https://fonts.adobe.com/
