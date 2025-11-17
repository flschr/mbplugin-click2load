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

**IMPORTANT:** The settings in `plugin.json` only work if you complete this setup!

1. **Install the plugin** via Micro.blog's plugin interface

2. **Add to your custom theme** (`layouts/partials/head.html` or `layouts/_default/baseof.html`):

```html
{{ partial "embed-consent-config.html" . }}
```

Without this line, the plugin will use default settings and ignore your configuration!

**For detailed Micro.blog instructions, see [MICROBLOG.md](MICROBLOG.md)**

That's it! The CSS and JavaScript are loaded automatically. Configure the plugin in the Micro.blog plugin settings.

### For Standard Hugo Sites

Add to your `layouts/_default/baseof.html`:

```html
<head>
    {{ partial "embed-consent-config.html" . }}
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    {{ block "main" . }}{{ end }}
    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
```

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

**Version**: 2.1.1
