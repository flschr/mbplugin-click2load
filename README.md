# Embed Consent Plugin for Hugo / Micro.blog

A privacy-first plugin that automatically adds consent overlays to all iframes on your website.

## Features

- **Automatic Detection**: Finds all iframes on your site automatically
- **Zero Manual Work**: Works with existing posts without changes
- **Privacy-First**: No external requests until user consent
- **Multi-language**: English and German with auto-detection
- **LocalStorage Support**: Remembers user preferences
- **No Dependencies**: Pure vanilla JavaScript and CSS

## Installation

1. Copy plugin files to your Hugo project:

```bash
cp -r layouts/ /path/to/your/hugo/site/
cp -r static/ /path/to/your/hugo/site/
```

2. Add to your `layouts/_default/baseof.html`:

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

3. Configure in `config.toml`:

```toml
[params.embedConsent]
  enableLocalStorage = true
  showAlwaysAllowOption = true
  language = "en"  # or "de" - auto-detects if not set
  privacyPolicyUrl = "/privacy/"
```

That's it! All iframes will now show a consent overlay before loading.

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLocalStorage` | boolean | `true` | Save user preference in browser |
| `showAlwaysAllowOption` | boolean | `true` | Show "Always allow" checkbox |
| `language` | string | auto | Language: `"en"` or `"de"` |
| `privacyPolicyUrl` | string | `""` | Link to privacy policy |

## Exclude Specific Iframes

To exclude certain iframes from consent:

```html
<iframe src="..." class="no-consent"></iframe>
```

## License

See [LICENSE](LICENSE) file.

---

**Version**: 2.1.1
