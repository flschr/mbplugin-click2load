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

1. Add to your `head.html`:

```html
{{ partial "embed-consent-config.html" . }}
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
```

2. Add to your `footer.html`:

```html
<script src="{{ "js/embed-consent.js" | relURL }}"></script>
```

That's it! All iframes will now show a consent overlay before loading.

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

## Configuration (Optional)

The plugin works out of the box with sensible defaults and auto-detects the browser language. Configuration in `config.toml` is completely optional:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLocalStorage` | boolean | `true` | Save user preference in browser |
| `showAlwaysAllowOption` | boolean | `true` | Show "Always allow" checkbox |
| `language` | string | auto-detect | Language: `"en"` or `"de"` |
| `privacyPolicyUrl` | string | `""` | Link to privacy policy |

Example `config.toml` (if you want to customize):

```toml
[params.embedConsent]
  enableLocalStorage = true
  showAlwaysAllowOption = true
  language = "en"
  privacyPolicyUrl = "/privacy/"
```

## Exclude Specific Iframes

To exclude certain iframes from consent:

```html
<iframe src="..." class="no-consent"></iframe>
```

## License

See [LICENSE](LICENSE) file.

---

**Version**: 2.1.1
