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

### For Micro.blog

1. **Install the plugin** via Micro.blog's plugin interface

2. **Add to your custom theme**:

**In `layouts/partials/head.html`:**
```html
{{ partial "embed-consent-config.html" . }}
{{ partial "embed-consent-noscript.html" . }}
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
```

**In `layouts/partials/footer.html`:**
```html
<script src="{{ "js/embed-consent.js" | relURL }}"></script>
```

That's it! No configuration needed. The plugin works with sensible defaults:
- ✅ LocalStorage enabled (remembers user preferences)
- ✅ "Always allow" checkbox shown
- ✅ Auto language detection (German/English based on browser settings)
- ✅ **NEW:** Graceful fallback styling when JavaScript is disabled

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

The plugin is designed with **progressive enhancement** in mind:

### With JavaScript Enabled:
- ✅ Privacy-first: iframes blocked until user consent
- ✅ Consent overlay with provider information
- ✅ User preferences saved (optional)

### Without JavaScript:
- ✅ **Iframes load normally** - users can see all embedded content
- ✅ **Responsive styling applied** via `<noscript>` CSS fallback
- ✅ **Friendly info message** shown to explain direct loading
- ✅ **Full accessibility** - screen readers work as expected

### Performance Benefits:
- 🚀 **Faster page loads** - third-party scripts blocked until needed
- 🚀 **Better Core Web Vitals** - fewer initial requests
- 🚀 **Reduced bandwidth** - users only load embeds they want
- 🚀 **Mobile-friendly** - less data consumption

## SEO Impact

**No negative SEO impact** - the plugin is SEO-neutral or positive:

- ✅ **Embedded content doesn't rank for your site** (it ranks for YouTube/Vimeo/etc.)
- ✅ **Your main content is unaffected** (text, images remain crawlable)
- ✅ **Googlebot understands consent mechanisms** (GDPR-compliant overlays are common)
- ✅ **Performance improvements help SEO** (faster sites rank better)
- ✅ **Without JS, iframes load normally** (search engines see full content)

**Recommendations for better SEO:**
- Use descriptive `title` attributes on iframes:
  ```html
  <iframe src="..." title="YouTube: Product Demo - How to Install"></iframe>
  ```
- For critical videos, consider adding Schema.org structured data (optional)
