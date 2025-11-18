# Micro.blog Installation & Konfiguration

## Das Problem

Die Einstellungen in der `plugin.json` werden in der Micro.blog-Oberfläche angezeigt, haben aber **keine automatische Wirkung**, weil eine wichtige Datei noch in Ihr Theme eingebunden werden muss.

## Die Lösung

### Schritt 1: Plugin installieren

Das Plugin ist bereits installiert, wenn Sie diese Anleitung lesen.

### Schritt 2: Theme-Anpassung (WICHTIG!)

**Das ist der fehlende Schritt!** Sie müssen CSS, JavaScript und die Konfiguration zu Ihrem Theme hinzufügen:

1. Gehen Sie zu **Design → Edit Custom Themes**
2. Öffnen Sie die Datei `layouts/partials/head.html` (oder erstellen Sie sie)
3. Fügen Sie diese Zeilen ein:

```html
{{ partial "embed-consent-config.html" . }}
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
```

4. Öffnen Sie die Datei `layouts/_default/baseof.html`
5. Fügen Sie vor dem schließenden `</body>`-Tag ein:

```html
<script src="{{ "js/embed-consent.js" | relURL }}"></script>
```

**Vollständiges Beispiel für `head.html`:**

```html
{{ partial "embed-consent-config.html" . }}
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">

<!-- Ihre anderen head-Inhalte -->
```

**Vollständiges Beispiel für `baseof.html`:**

```html
<!DOCTYPE html>
<html>
<head>
    {{ partial "embed-consent-config.html" . }}
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    {{ block "main" . }}{{ end }}

    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
</html>
```

### Schritt 3: Einstellungen konfigurieren

Jetzt können Sie die Einstellungen im Micro.blog-Plugin-Interface anpassen:

- **Enable LocalStorage**: Speichert Nutzer-Präferenzen im Browser
- **Show 'Always allow' checkbox**: Zeigt die "Immer erlauben"-Option an
- **Language**: `de` für Deutsch, `en` für Englisch, leer für Auto-Erkennung
- **Privacy policy URL**: Link zu Ihrer Datenschutzerklärung (z.B. `/datenschutz/`)

### Schritt 4: Testen

1. Öffnen Sie eine Seite mit einem YouTube-Video, Vimeo-Video oder anderem iframe
2. Sie sollten jetzt ein Consent-Overlay sehen
3. Öffnen Sie die **Browser-Konsole** (F12 → Console)
4. Suchen Sie nach der Zeile: `Embed Consent Config: {...}`
5. Prüfen Sie, ob Ihre Einstellungen korrekt angezeigt werden

## Troubleshooting

### Problem: Overlay wird nicht angezeigt

**Lösung:**
1. Prüfen Sie, ob alle 3 Einträge im Theme sind:
   - `{{ partial "embed-consent-config.html" . }}` im `<head>`
   - `<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}>` im `<head>`
   - `<script src="{{ "js/embed-consent.js" | relURL }}"></script>` vor `</body>`
2. Browser-Cache leeren (Hard Reload: Strg+Shift+R)
3. Browser-Konsole öffnen (F12) und nach Fehlern suchen

### Problem: Einstellungen werden nicht übernommen

**Ursache:** CSS, JavaScript oder die Partial-Datei fehlen im Theme!

**Lösung:**
1. Öffnen Sie die Browser-Konsole (F12)
2. Suchen Sie nach `Embed Consent Config:`
3. Falls Sie diese Zeile **nicht** sehen, fehlt die Partial-Einbindung
4. Prüfen Sie, ob das Overlay gestylt ist (falls nicht: CSS fehlt)
5. Fügen Sie alle 3 Einträge zu Ihrem Theme hinzu (siehe Schritt 2)

### Problem: Console zeigt "Using default configuration"

Das bedeutet, dass die Konfiguration aus `plugin.json` nicht gelesen werden kann.

**Mögliche Ursachen:**
1. Die Partial-Datei ist nicht eingebunden → Siehe Schritt 2
2. Micro.blog stellt die Parameter unter einem anderen Pfad bereit

**Debug-Schritte:**
1. Öffnen Sie die Browser-Konsole
2. Geben Sie ein: `document.documentElement.dataset`
3. Prüfen Sie, ob `embedConsentStorage`, `embedConsentAlwaysAllow` usw. vorhanden sind
4. Falls **nicht vorhanden**: Die Partial wird nicht ausgeführt
5. Falls **vorhanden**: Die Konfiguration wird korrekt geladen

## Technische Details

### Warum müssen CSS, JS und Partial manuell eingebunden werden?

- Micro.blog installiert das Plugin, aber Theme-Anpassungen müssen manuell erfolgen
- Die Partial `embed-consent-config.html` liest die Werte aus `plugin.json` und setzt sie als `data-*` Attribute
- Das CSS `embed-consent.css` stellt das Overlay-Design bereit
- Das JavaScript `embed-consent.js` liest die `data-*` Attribute und macht die iframes interaktiv

### Wie funktioniert die Konfiguration?

1. Sie setzen Werte in der Micro.blog-Plugin-UI
2. Micro.blog speichert diese als Hugo-Parameter
3. Die Partial `embed-consent-config.html` liest die Parameter
4. Die Partial setzt `data-*` Attribute am `<html>`-Element
5. Das JavaScript `embed-consent.js` liest diese Attribute
6. Das Plugin verwendet die Konfiguration

### Konfigurationspfade

Die Partial versucht die Werte an mehreren Stellen zu finden:

1. `.Site.Params.embedConsent.*` (Standard Hugo)
2. `.Site.Params.params.embedConsent.*` (Micro.blog Variante 1)
3. `.Site.Params["params.embedConsent.*"]` (Micro.blog Variante 2)

Falls Sie **wissen**, wo Micro.blog die Plugin-Parameter speichert, können Sie die Partial entsprechend anpassen.

## Minimale Konfiguration (Fallback)

Falls Sie die Partial **nicht** einbinden möchten/können, verwendet das Plugin diese Defaults:

- LocalStorage: **aktiviert**
- "Immer erlauben"-Checkbox: **sichtbar**
- Sprache: **Auto-Erkennung** (basierend auf Browser-Sprache)
- Datenschutz-Link: **keiner**

## Weitere Hilfe

Falls Sie weiterhin Probleme haben:

1. Prüfen Sie die Browser-Konsole auf Fehler
2. Schauen Sie sich die [vollständige Dokumentation](README.md) an
3. Erstellen Sie ein Issue auf GitHub mit:
   - Screenshot der Browser-Konsole
   - Ihr Theme-Setup
   - Die Einstellungen, die Sie verwenden möchten
