# Schnell-Installation (5 Minuten)

Dieses Plugin funktioniert **automatisch** - keine manuelle Anpassung von Posts nötig!

## Was passiert?

Nach der Installation findet das Plugin **automatisch alle iframes** auf deiner Website und versieht sie mit einem Consent-Overlay. Du musst **nichts** in bestehenden Posts ändern!

---

## Schritt 1: Dateien kopieren

Kopiere die Plugin-Dateien in dein Hugo-Projekt:

```bash
# Aus dem Plugin-Verzeichnis
cp -r layouts/ /pfad/zu/deiner/hugo/site/
cp -r static/ /pfad/zu/deiner/hugo/site/
```

Resultierende Struktur:

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

---

## Schritt 2: Base Template anpassen

Bearbeite `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
    <!-- Dein bestehender head-Content -->

    <!-- NEU: Embed Consent Config -->
    {{ partial "embed-consent-config.html" . }}

    <!-- NEU: Embed Consent CSS -->
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    {{ block "main" . }}{{ end }}

    <!-- Deine bestehenden Scripts -->

    <!-- NEU: Embed Consent JS (vor </body>) -->
    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
</html>
```

### Alternative: Partials nutzen

Falls du Partials für head/footer verwendest:

**`layouts/partials/head-extend.html`:**
```html
{{ partial "embed-consent-config.html" . }}
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
```

**`layouts/partials/footer-extend.html`:**
```html
<script src="{{ "js/embed-consent.js" | relURL }}"></script>
```

---

## Schritt 3: Testen (Keine Konfiguration nötig!)

Das Plugin funktioniert sofort mit vernünftigen Defaults:
- ✅ LocalStorage aktiviert (merkt sich User-Präferenzen)
- ✅ "Immer erlauben" Checkbox wird angezeigt
- ✅ Automatische Spracherkennung (Deutsch/Englisch basierend auf Browser-Einstellungen)

### 1. Hugo Server starten

```bash
hugo server -D
```

### 2. Seite mit iframe öffnen

Öffne einen Post, der ein YouTube-Video, Vimeo-Video oder anderes iframe enthält.

### 3. Ergebnis prüfen

Du solltest sehen:

✅ Ein **Consent-Overlay** über dem iframe
✅ **Provider-Logo** (YouTube, Vimeo, ARTE)
✅ **"Inhalt laden" Button**
✅ **"Immer erlauben" Checkbox**

### 4. Funktionstest

- Klicke "Inhalt laden" → iframe lädt
- Aktiviere Checkbox → Preference wird gespeichert
- Seite neu laden → Bei gespeicherter Preference laden iframes automatisch

---

## Checkliste

- [ ] Dateien kopiert (`layouts/`, `static/css/`, `static/js/`, `static/img/`)
- [ ] `{{ partial "embed-consent-config.html" . }}` im `<head>`
- [ ] CSS eingebunden (im `<head>`)
- [ ] JS eingebunden (vor `</body>`)
- [ ] Hugo Server gestartet
- [ ] Consent-Overlay wird angezeigt
- [ ] Provider-Logos werden angezeigt (ARTE, YouTube, etc.)
- [ ] iframe lädt nach Klick
- [ ] Keine Console-Errors (F12 → Console)

---

## Troubleshooting

### Problem: Overlay wird nicht angezeigt

**Lösung:**
1. Browser DevTools öffnen (F12)
2. **Console-Tab**: Fehler prüfen
3. **Network-Tab**: Prüfen ob CSS/JS laden (200 OK)

### Problem: Button tut nichts

**Lösung:**
1. Console-Tab prüfen (F12)
2. Sicherstellen dass `embed-consent.js` geladen ist
3. Prüfen ob JavaScript-Fehler angezeigt werden

### Problem: Plugin lädt nicht richtig

**Lösung:**
1. Hugo Server neu starten (`Ctrl+C`, dann `hugo server` wieder)
2. Browser Cache leeren (Hard Refresh: `Ctrl+Shift+R`)
3. Prüfen ob Partial eingebunden ist: `{{ partial "embed-consent-config.html" . }}`

### Problem: Bestimmte iframes sollen NICHT geschützt werden

**Lösung:**
Füge CSS-Klasse oder Attribut hinzu:

```html
<iframe src="..." class="no-consent"></iframe>
```

Oder:

```html
<iframe src="..." data-no-consent></iframe>
```

---

## Für Micro.blog

Auf Micro.blog:

1. **Plugin installieren** via Plugin-Manager
2. **Theme anpassen**: Füge alle 3 Einträge zu deinem Theme hinzu:
   - `{{ partial "embed-consent-config.html" . }}` im `<head>`
   - `<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}>` im `<head>`
   - `<script src="{{ "js/embed-consent.js" | relURL }}"></script>` vor `</body>`

*Details siehe README.md und MICROBLOG.md*

---

## Was passiert technisch?

### Beim Seitenaufbau:

1. **JavaScript lädt** und findet alle `<iframe>` Elemente
2. **Provider wird erkannt** (YouTube, Vimeo, ARTE, etc.)
3. **iframe.src wird entfernt** → wird zu `data-consent-src`
4. **Wrapper + Overlay** wird um iframe herum erstellt
5. **LocalStorage wird geprüft**: Falls "Immer erlauben" gesetzt → iframe lädt direkt

### Nach Klick auf "Inhalt laden":

1. `data-consent-src` → `src` (iframe lädt)
2. Falls Checkbox aktiv: Preference in localStorage speichern
3. Overlay ausblenden
4. iframe ist jetzt sichtbar

---

## Schnellreferenz

### Browser-Funktionen

```javascript
// Consent-Status prüfen
window.EmbedConsent.getStatus()

// Consent zurücksetzen
window.EmbedConsent.reset()
```

### iframes ausschließen

```html
<!-- Wird NICHT geschützt -->
<iframe src="..." class="no-consent"></iframe>
<iframe src="..." data-no-consent></iframe>
```

---

**Fertig!** Alle iframes auf deiner Website sind jetzt automatisch geschützt. 🎉

**Fragen?** → Siehe [README.md](README.md) für ausführliche Dokumentation.
