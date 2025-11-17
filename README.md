# Embed Consent Plugin for Hugo / Micro.blog

A complete, privacy-focused embeddable content plugin for Hugo and Micro.blog that implements a consent-based loading mechanism for external media (YouTube, Vimeo, ARTE, and generic embeds).

## Features

- **Privacy-First**: External media doesn't load until user consent is given
- **LocalStorage Support**: Remember user preferences across visits
- **Internationalization**: Built-in German and English support
- **Customizable**: Override all text labels and styling
- **Responsive**: Works perfectly on all screen sizes
- **Accessible**: Keyboard navigation and screen-reader friendly
- **Theme-Aware**: Respects your site's border-radius and color scheme
- **No Dependencies**: Pure vanilla JavaScript and CSS

## Quick Start

### 1. Installation

#### For Hugo Sites

Clone or download this plugin into your Hugo site's directory:

```bash
# Option 1: As a Hugo module (recommended)
# Add to your config.toml:
# [module]
#   [[module.imports]]
#     path = "github.com/yourusername/mbplugin-click2load"

# Option 2: Manual installation
# Copy the files directly into your Hugo site:
cp -r layouts/ /path/to/your/hugo/site/
cp -r static/ /path/to/your/hugo/site/
```

#### For Micro.blog

Upload the plugin files to your Micro.blog site through the plugin manager, or copy them into your site's custom theme directory.

### 2. Include Assets in Your Theme

Add the CSS and JavaScript to your `layouts/_default/baseof.html` (or your main layout template):

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
    <!-- Your existing head content -->

    <!-- Embed Consent CSS -->
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    <!-- Your content -->

    <!-- Your existing scripts -->

    <!-- Embed Consent JS (before closing body tag) -->
    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
</html>
```

### 3. Configure the Plugin

Add configuration to your `config.toml`:

```toml
[params.embedConsent]
  enableLocalStorage = true
  showAlwaysAllowOption = true
  language = "en"  # or "de" for German
  privacyPolicyUrl = "/privacy/"
```

Or in `config.yaml`:

```yaml
params:
  embedConsent:
    enableLocalStorage: true
    showAlwaysAllowOption: true
    language: en  # or "de" for German
    privacyPolicyUrl: /privacy/
```

### 4. Use the Shortcode

In your content files (`.md`), use the `embed` shortcode:

```markdown
## YouTube Example

{{< embed provider="youtube" id="dQw4w9WgXcQ" title="Rick Astley - Never Gonna Give You Up" >}}

## Vimeo Example

{{< embed provider="vimeo" id="76979871" title="The New Vimeo Player" >}}

## ARTE Example

{{< embed provider="arte" url="https://www.arte.tv/player/v5/index.php?json_url=..." title="ARTE Documentary" >}}

## Generic Embed with Thumbnail

{{< embed provider="generic" url="https://example.com/embed/video" title="Custom Video" thumbnail="/images/video-preview.jpg" >}}
```

## Configuration Options

### Site-Wide Settings (`config.toml`)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLocalStorage` | boolean | `true` | Enable localStorage to remember user preferences |
| `showAlwaysAllowOption` | boolean | `true` | Show "Always allow" checkbox in consent overlay |
| `language` | string | `"en"` | Default language: `"en"` or `"de"` |
| `privacyPolicyUrl` | string | `""` | Optional link to your privacy policy page |

### Shortcode Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `provider` | string | No | One of: `youtube`, `vimeo`, `arte`, `generic` |
| `id` | string | Conditional* | Video ID for YouTube or Vimeo |
| `url` | string | Conditional* | Full embed URL for ARTE or generic embeds |
| `title` | string | No | Title for the iframe (accessibility) |
| `ratio` | string | No | Aspect ratio: `16/9` (default), `4/3`, `1/1`, `21/9` |
| `thumbnail` | string | No | Path to local preview image |
| `consent_text` | string | No | Override default consent text |
| `button_label` | string | No | Override button text |
| `always_allow_label` | string | No | Override checkbox text |

\* Either `id` (for YouTube/Vimeo) or `url` (for ARTE/generic) is required

## Usage Examples

### YouTube Video

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" title="Rick Astley - Never Gonna Give You Up" >}}
```

### YouTube with Custom Aspect Ratio

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" ratio="21/9" >}}
```

### Vimeo Video

```markdown
{{< embed provider="vimeo" id="76979871" title="Beautiful Video" >}}
```

### ARTE Video

```markdown
{{< embed provider="arte" url="https://www.arte.tv/player/v5/index.php?json_url=https%3A%2F%2Fapi.arte.tv%2Fapi%2Fplayer%2Fv2%2Fconfig%2Fde%2F123456" title="ARTE Documentary" >}}
```

### Custom Embed with Thumbnail

```markdown
{{< embed
    provider="generic"
    url="https://example.com/embed/video"
    title="Custom Video"
    thumbnail="/images/video-thumb.jpg"
    ratio="4/3"
>}}
```

### Custom Text Override (Multilingual)

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    consent_text="This video is hosted by YouTube. Click to load."
    button_label="Watch Video"
    always_allow_label="Remember my choice"
>}}
```

## Internationalization

The plugin includes built-in translations for German and English. Set your preferred language in `config.toml`:

```toml
[params.embedConsent]
  language = "de"  # German
```

### Default Translations

**English (`en`)**:
- Consent text: "This embedded content is provided by an external service. By loading this content, data will be transmitted to third parties."
- Button: "Load content"
- Always allow: "Always allow external media on this site"

**German (`de`)**:
- Consent text: "Dieses eingebettete Medium wird von einem externen Anbieter bereitgestellt. Durch das Laden dieses Inhalts werden Daten an Dritte übertragen."
- Button: "Inhalt laden"
- Always allow: "Externe Medien auf dieser Website immer erlauben"

### Adding Custom Languages

To add more languages, modify the `$translations` dictionary in `layouts/shortcodes/embed.html`.

## LocalStorage Behavior

### How It Works

1. **First Visit**: User sees consent overlay for each embed
2. **User Clicks "Load content"**:
   - Embed loads immediately
   - If "Always allow" checkbox is checked, preference is saved to localStorage
3. **Subsequent Visits**:
   - If preference is saved, embeds load automatically without overlay
   - No consent overlay is shown

### Managing Consent

Users can reset their consent preference from the browser console:

```javascript
// Check current consent status
getEmbedConsentStatus()

// Reset consent (will require consent again on next page load)
resetEmbedConsent()
```

### Revoking Consent

To give users a way to revoke consent, add a button to your privacy policy page:

```html
<button onclick="resetEmbedConsent()">
  Reset Embed Preferences
</button>
```

## Styling and Theming

### Theme Integration

The plugin respects your theme's design tokens:

```css
:root {
  /* If your theme defines this, the plugin will use it */
  --radius-default: 1rem;
}
```

### Customizing Colors

Override CSS custom properties in your theme:

```css
:root {
  --embed-consent-radius: 0.75rem;
  --embed-consent-button-bg: #ff6b6b;
  --embed-consent-button-hover-bg: #ee5a5a;
}
```

### Dark Mode

The plugin automatically adapts to dark mode via:
- `prefers-color-scheme: dark` media query
- `.dark` class on any parent element
- `[data-theme="dark"]` attribute

## Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Older Browsers**: Graceful degradation with fallback aspect-ratio technique
- **No JavaScript**: Displays fallback message with direct link to content

## Privacy Considerations

This plugin is designed with privacy in mind:

1. **No Cookies**: Uses localStorage only (user-controlled)
2. **No External Requests**: Until user explicitly consents
3. **No Tracking**: Plugin itself doesn't track anything
4. **GDPR Compliant**: Requires explicit user action before loading external content
5. **Configurable**: Can disable localStorage entirely if needed

### Disabling LocalStorage

If you want to comply with strict privacy regulations that prohibit any client-side storage:

```toml
[params.embedConsent]
  enableLocalStorage = false
  showAlwaysAllowOption = false
```

This will require consent for every embed on every page load.

## Troubleshooting

### Embeds Not Loading

1. **Check JavaScript**: Ensure `embed-consent.js` is loaded correctly
2. **Check Console**: Open browser DevTools and look for errors
3. **Check Parameters**: Ensure you provided either `id` or `url`

### Styles Not Applied

1. **Check CSS**: Ensure `embed-consent.css` is loaded in `<head>`
2. **Check Specificity**: Your theme's CSS might be overriding styles
3. **Clear Cache**: Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

### LocalStorage Not Working

1. **Browser Support**: Check if localStorage is available
2. **Privacy Mode**: localStorage is disabled in private/incognito mode
3. **Browser Settings**: User might have disabled storage in browser settings

Run this in console to test:

```javascript
getEmbedConsentStatus()
```

## Development

### File Structure

```
mbplugin-click2load/
├── layouts/
│   └── shortcodes/
│       └── embed.html          # Hugo shortcode template
├── static/
│   ├── css/
│   │   └── embed-consent.css   # Plugin styles
│   └── js/
│       └── embed-consent.js    # Plugin JavaScript
├── LICENSE
└── README.md
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

See the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing issues on GitHub
3. Open a new issue with detailed information

## Credits

Developed for the Hugo and Micro.blog community with privacy and user experience as top priorities.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-17
