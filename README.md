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

## License

See [LICENSE](LICENSE) file.

---

**Version**: 2.2.0 - Zero configuration, just works!
