# Click-2-Load Plugin for Micro.blog

A privacy-first plugin that automatically adds consent overlays to all iframes on your website.

## Features

- **Automatic Detection**: Finds all iframes on your site automatically
- **Zero Manual Work**: Works with existing posts without changes
- **Privacy-First**: No external requests until user consent
- **Multi-language**: English and German with auto-detection
- **LocalStorage Support**: Remembers user preferences
- **No Dependencies**: Pure vanilla JavaScript and CSS

## Installation

**Requirements:** Custom theme with access to `layouts/partials/` directory

### Steps:

1. **Install the plugin** via Micro.blog's plugin interface

2. **Add to your theme's `layouts/partials/head.html`:**
   ```html
   {{ partial "embed-consent-config.html" . }}
   {{ partial "embed-consent-noscript.html" . }}
   <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
   ```

3. **Add to your theme's `layouts/partials/footer.html`:**
   ```html
   <script src="{{ "js/embed-consent.js" | relURL }}"></script>
   ```

That's it! The plugin works with sensible defaults:
- ✅ LocalStorage enabled (remembers user preferences)
- ✅ "Always allow" checkbox shown
- ✅ Auto language detection (German/English based on browser settings)
- ✅ Responsive iframe styling (works with and without JavaScript)

## Supported Services

The plugin automatically detects and displays logos for these services:

- **YouTube** (including youtube-nocookie.com)
- **Vimeo**
- **ARTE**
- **Komoot**
- **Google Maps**
- **OpenStreetMap**

All other iframes are supported but shown with a generic overlay.

## Exclude Specific Iframes

To exclude certain iframes from consent:

```html
<iframe src="..." class="no-consent"></iframe>
```

## JavaScript Disabled / Accessibility

The plugin handles the no-JavaScript scenario gracefully:

### With JavaScript Enabled:
- ✅ Privacy-first: iframes blocked until user consent
- ✅ Consent overlay with provider information
- ✅ User preferences saved (optional)

### Without JavaScript:
- ℹ️ **Iframes are completely hidden** (display: none)
- ℹ️ **Global notice displayed**: A clear, visible message box appears at the top of the page
- ℹ️ **Clear message**: "JavaScript is required to load embedded content"
- ℹ️ **Multi-language support**: German/English bilingual notice
- ℹ️ **Rationale**: External services (YouTube, ARTE, Maps, etc.) require JavaScript anyway
- ✅ **Better UX**: Prevents partially loaded, non-functional embeds
- ✅ **Dark mode support** - notice adapts to color scheme
- ✅ **Responsive design** - works on all screen sizes

**Why block without JavaScript?**
External embedded services themselves require JavaScript to function:
- YouTube videos won't play without JS
- Google Maps/OSM won't be interactive without JS
- Komoot tours won't load without JS

Hiding iframes and showing a clear global notice is more user-friendly than displaying broken, non-functional iframes.

**Exclude iframes from blocking:** Use `class="no-consent"` on iframes that work without JavaScript.

### Performance Benefits:
- 🚀 **Faster page loads** - third-party scripts blocked until needed
- 🚀 **Better Core Web Vitals** - fewer initial requests
- 🚀 **Reduced bandwidth** - users only load embeds they want
- 🚀 **Mobile-friendly** - less data consumption

## SEO Impact

**No negative SEO impact** - the plugin is SEO-neutral or positive:

- ✅ **Embedded content doesn't rank for your site** (it ranks for YouTube/Vimeo/etc.)
- ✅ **Your main content is unaffected** (text, images remain crawlable)
- ✅ **Googlebot renders JavaScript** (modern search engines execute JS and see consent overlays)
- ✅ **Performance improvements help SEO** (faster sites rank better)
- ✅ **Embedded content is still discoverable** (Googlebot renders the consent overlay and can load iframes)

**Recommendations for better SEO:**
- Use descriptive `title` attributes on iframes:
  ```html
  <iframe src="..." title="YouTube: Product Demo - How to Install"></iframe>
  ```
- For critical videos, consider adding Schema.org structured data (optional)
