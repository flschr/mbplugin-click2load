# Embed Consent Plugin for Hugo / Micro.blog

**Ein Privacy-First Plugin, das automatisch ALLE iframes auf deiner Website findet und mit einem Consent-Overlay versieht.**

Einmal installiert, keine manuelle Anpassung von Posts nötig!

## Features

✅ **Automatische Erkennung**: Findet alle iframes auf deiner Website
✅ **Null manuelle Arbeit**: Funktioniert mit bestehenden Posts ohne Änderungen
✅ **Provider-Erkennung**: Erkennt automatisch YouTube, Vimeo, ARTE und andere
✅ **Privacy-First**: Keine externen Requests bis zur Einwilligung
✅ **LocalStorage Support**: Merkt sich User-Präferenzen
✅ **Mehrsprachig**: Deutsch und Englisch eingebaut mit automatischer Browser-Spracherkennung
✅ **Theme-bewusst**: Passt sich an dein Design an
✅ **Keine Dependencies**: Pure Vanilla JavaScript und CSS

## Wie funktioniert es?

1. **Du installierst das Plugin** → CSS + JS einbinden
2. **Fertig!** → Alle iframes werden automatisch geschützt

**Das wars!** Die Sprache wird automatisch erkannt, keine Änderungen an bestehenden Posts nötig.

## Quick Start

### Schritt 1: Dateien kopieren

Kopiere die Plugin-Dateien in dein Hugo-Projekt:

```bash
# Kopiere die Dateien
cp -r layouts/ /pfad/zu/deiner/hugo/site/
cp -r static/ /pfad/zu/deiner/hugo/site/
```

Deine Struktur sieht dann so aus:

```
deine-hugo-site/
├── layouts/
│   └── partials/
│       └── embed-consent-config.html   # ← Neu
├── static/
│   ├── css/
│   │   └── embed-consent.css           # ← Neu
│   ├── img/                            # ← Neu
│   │   ├── ARTE-Logo.png               # ← Neu
│   │   ├── YouTube-Logo.png            # ← Neu
│   │   ├── Vimeo-Logo.png              # ← Neu
│   │   ├── Komoot-Logo.png             # ← Neu
│   │   ├── OSM-Logo.png                # ← Neu
│   │   └── Google_Maps-Logo.png        # ← Neu
│   └── js/
│       └── embed-consent.js            # ← Neu
```

### Schritt 2: Assets einbinden

Bearbeite dein `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
    <!-- Dein bestehender head-Content -->

    <!-- Embed Consent Config -->
    {{ partial "embed-consent-config.html" . }}

    <!-- Embed Consent CSS -->
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    {{ block "main" . }}{{ end }}

    <!-- Deine bestehenden Scripts -->

    <!-- Embed Consent JS (vor </body>) -->
    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
</html>
```

### Schritt 3: Konfiguration

Füge in deine `config.toml` ein:

```toml
[params.embedConsent]
  enableLocalStorage = true
  showAlwaysAllowOption = true
  language = "de"  # oder "en"
  privacyPolicyUrl = "/datenschutz/"
```

Oder in `config.yaml`:

```yaml
params:
  embedConsent:
    enableLocalStorage: true
    showAlwaysAllowOption: true
    language: de  # oder "en"
    privacyPolicyUrl: /datenschutz/
```

### Schritt 4: Testen!

1. Starte deinen Hugo Server:
   ```bash
   hugo server -D
   ```

2. Besuche eine Seite mit einem iframe (YouTube, Vimeo, etc.)

3. Du solltest jetzt sehen:
   - Ein Consent-Overlay über dem iframe
   - Einen "Inhalt laden" Button
   - Optional: "Immer erlauben" Checkbox

4. Klicke den Button → Video lädt!

## Wie es funktioniert (Technisch)

### Automatische iframe-Erkennung

Das JavaScript:
1. **Findet** beim Seitenaufbau alle `<iframe>` Elemente
2. **Erkennt** automatisch den Provider (YouTube, Vimeo, ARTE, etc.)
3. **Ersetzt** das iframe durch einen Wrapper mit Consent-Overlay
4. **Lädt** das iframe erst nach Klick

### Unterstützte Provider

- **YouTube**: `youtube.com/embed/*`, `youtube-nocookie.com/embed/*`
- **Vimeo**: `player.vimeo.com/video/*`
- **ARTE**: `arte.tv/player/*`
- **Alle anderen**: Generisches Overlay für jeden iframe

### Beispiel: Vorher / Nachher

**Vorher (in deinem Markdown):**
```markdown
---
title: "Mein Blogpost"
---

Schau dir dieses Video an:

<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>
```

**Nachher (automatisch im Browser):**
```html
<div class="embed-consent-wrapper">
    <div class="embed-consent-overlay">
        <!-- Consent UI -->
        <button>Inhalt laden</button>
    </div>
    <iframe data-consent-src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
</div>
```

**Du musst NICHTS am Markdown ändern!** Das Plugin macht alles automatisch.

## Konfigurationsoptionen

### Site-weite Einstellungen (`config.toml`)

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `enableLocalStorage` | boolean | `true` | Speichert User-Präferenz im Browser |
| `showAlwaysAllowOption` | boolean | `true` | Zeigt "Immer erlauben" Checkbox |
| `language` | string | auto | Sprache: `"de"` oder `"en"` (auto-detect wenn nicht gesetzt) |
| `privacyPolicyUrl` | string | `""` | Link zur Datenschutzerklärung |

### Erweiterte Optionen

#### Bestimmte iframes ausschließen

Falls du bestimmte iframes NICHT mit Consent versehen willst:

```html
<!-- Dieser iframe wird NICHT geschützt -->
<iframe src="..." class="no-consent"></iframe>

<!-- Oder mit data-Attribut -->
<iframe src="..." data-no-consent></iframe>
```

Das Plugin überspringt automatisch iframes mit:
- CSS-Klasse `.no-consent`
- Attribut `data-no-consent`

## Mehrsprachigkeit

### Automatische Spracherkennung

**Standardverhalten:** Das Plugin erkennt automatisch die Browser-Sprache (`navigator.language`).

- Browser auf Deutsch → Deutsche Texte werden angezeigt
- Browser auf Englisch → Englische Texte werden angezeigt
- Andere Sprachen → Englisch als Fallback

**Keine Konfiguration notwendig!** Wenn du den `language` Parameter **nicht** in der `config.toml` setzt, wird die Sprache automatisch erkannt.

### Sprache manuell festlegen

Falls du die Sprache für alle Besucher festlegen möchtest:

#### Deutsch

```toml
[params.embedConsent]
  language = "de"
```

**Texte:**
- "Dieses eingebettete Medium wird von einem externen Anbieter bereitgestellt..."
- Button: "Inhalt laden"
- Checkbox: "Externe Medien auf dieser Website immer erlauben"

#### Englisch

```toml
[params.embedConsent]
  language = "en"
```

**Texte:**
- "This embedded content is provided by an external service..."
- Button: "Load content"
- Checkbox: "Always allow external media on this site"

## LocalStorage Verhalten

### Wie funktioniert die Speicherung?

1. **Erster Besuch**: User sieht Consent-Overlay bei jedem iframe
2. **User klickt "Inhalt laden"**:
   - iframe lädt sofort
   - Wenn Checkbox "Immer erlauben" aktiviert: Präferenz wird gespeichert
3. **Nächste Besuche**:
   - Wenn Präferenz gespeichert: Alle iframes laden automatisch
   - Kein Overlay wird angezeigt

### Consent widerrufen

User können ihre Einwilligung zurücksetzen:

**Per Browser-Konsole:**
```javascript
EmbedConsent.reset()
```

**Per Button auf Datenschutz-Seite:**
```html
<button onclick="EmbedConsent.reset()">
  Einwilligung zurücksetzen
</button>
```

**Status prüfen:**
```javascript
EmbedConsent.getStatus()
// → { available: true, consent: true, message: "..." }
```

**Plugin-Version abfragen:**
```javascript
EmbedConsent.version
// → "2.1.0"
```

**Cleanup (bei SPA-Navigation):**
```javascript
EmbedConsent.cleanup()
```

## Styling und Theme-Integration

### Automatische Theme-Anpassung

Das Plugin respektiert dein Theme:

```css
:root {
  /* Falls dein Theme das definiert, nutzt das Plugin es */
  --radius-default: 1rem;
}
```

### Farben anpassen

Überschreibe CSS-Variablen in deinem Theme:

```css
:root {
  --embed-consent-radius: 0.75rem;
  --embed-consent-button-bg: #ff6b6b;
  --embed-consent-button-hover-bg: #ee5a5a;
}
```

### Dark Mode

Das Plugin unterstützt automatisch:
- `prefers-color-scheme: dark` Media Query
- `.dark` Klasse auf Parent-Element
- `[data-theme="dark"]` Attribut

## Privacy & DSGVO

### Privacy-konform

✅ **Keine Cookies**: Nutzt nur localStorage (User-kontrolliert)
✅ **Keine externen Requests**: Bis zur expliziten Einwilligung
✅ **Kein Tracking**: Plugin selbst trackt nichts
✅ **DSGVO-konform**: Explizite Nutzeraktion erforderlich
✅ **Konfigurierbar**: LocalStorage kann komplett deaktiviert werden

### Strict Privacy Mode

Für maximale Privacy (kein Client-side Storage):

```toml
[params.embedConsent]
  enableLocalStorage = false
  showAlwaysAllowOption = false
  language = "de"
```

Dann ist bei jedem Seitenaufbau eine neue Einwilligung nötig.

## Browser Support

- **Moderne Browser**: Volle Unterstützung (Chrome, Firefox, Safari, Edge)
- **Ältere Browser**: Graceful Degradation
- **Kein JavaScript**: iframes laden nicht (Privacy-konform)

## Troubleshooting

### iframes laden nicht

1. **JavaScript aktiv?**: Prüfe Browser-Konsole (F12)
2. **CSS geladen?**: Network-Tab → `embed-consent.css` sollte 200 OK sein
3. **Config korrekt?**: Prüfe `config.toml` Syntax

### Overlay wird nicht angezeigt

1. **Partial eingebunden?**: `{{ partial "embed-consent-config.html" . }}` im `<head>`
2. **JS geladen?**: Network-Tab → `embed-consent.js` sollte 200 OK sein
3. **iframe hat src?**: Nur iframes mit `src` werden geschützt

### LocalStorage funktioniert nicht

1. **Privacy Mode?**: In Incognito/Private Browsing ist localStorage deaktiviert
2. **Browser-Einstellung?**: User könnte Storage deaktiviert haben
3. **Test**: Browser-Konsole → `getEmbedConsentStatus()`

### Bestimmte iframes sollen nicht geschützt werden

Füge CSS-Klasse oder Attribut hinzu:

```html
<iframe src="..." class="no-consent"></iframe>
```

Oder:

```html
<iframe src="..." data-no-consent></iframe>
```

## Entwicklung & Contribution

### Dateistruktur

```
mbplugin-click2load/
├── layouts/
│   └── partials/
│       └── embed-consent-config.html   # Config injection
├── static/
│   ├── css/
│   │   └── embed-consent.css          # Styles
│   ├── img/                           # Provider logos
│   │   ├── ARTE-Logo.png
│   │   ├── YouTube-Logo.png
│   │   ├── Vimeo-Logo.png
│   │   ├── Komoot-Logo.png
│   │   ├── OSM-Logo.png
│   │   └── Google_Maps-Logo.png
│   └── js/
│       └── embed-consent.js           # Auto-detection logic
├── CHANGELOG.md
├── INSTALL.md
└── README.md
```

### Neue Provider hinzufügen

Bearbeite `static/js/embed-consent.js`:

```javascript
const PROVIDERS = {
    // ...existing providers...
    twitch: {
        patterns: [
            /twitch\.tv\/embed\//i
        ],
        name: 'Twitch',
        icon: '<svg>...</svg>'
    }
};
```

### Weitere Sprachen hinzufügen

Bearbeite `static/js/embed-consent.js`:

```javascript
const TRANSLATIONS = {
    // ...existing languages...
    fr: {
        consentText: 'Ce contenu intégré est fourni par un service externe...',
        buttonLabel: 'Charger le contenu',
        // ...
    }
};
```

## Migration von anderen Plugins

### Von Cookie Consent Plugins

1. Altes Plugin deinstallieren
2. Dieses Plugin installieren
3. Fertig! Keine Content-Änderungen nötig

### Von Shortcode-basierten Lösungen

1. Plugin installieren
2. Alte Shortcodes können bleiben (funktionieren weiter als normale iframes)
3. Plugin schützt automatisch alle iframes

## Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für Version History.

## License

Siehe [LICENSE](LICENSE) Datei.

## Support

Bei Fragen oder Problemen:

1. [Troubleshooting](#troubleshooting) lesen
2. Issue auf GitHub öffnen
3. Pull Request mit Verbesserungen

## Credits

Entwickelt für die Hugo und Micro.blog Community mit Fokus auf Privacy und User Experience.

---

**Version**: 2.1.0
**Letztes Update**: 2025-11-17
**Modus**: Automatische iframe-Erkennung

## Was ist neu in v2.1.0?

🚀 **Major Performance & Security Update**

- **🔒 Sicherheit**: XSS-Schutz für alle dynamischen HTML-Einfügungen
- **⚡ Performance**: Optimierte iframe-Verarbeitung (O(n²) → O(n))
- **🎯 Debouncing**: Reduzierte CPU-Last durch intelligentes Batching
- **🧹 Memory Leaks**: Cleanup-Funktionen für SPA-Anwendungen
- **📦 Code Quality**: Refactored Aspect-Ratio Logik (42 → 5 Zeilen/Funktion)
- **🌐 API**: Neue `EmbedConsent.*` Namespace (alte API weiterhin unterstützt)

Siehe [CHANGELOG.md](CHANGELOG.md) für alle Details.
