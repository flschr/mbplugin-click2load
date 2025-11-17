# Changelog

Alle wichtigen Änderungen am Embed Consent Plugin werden in dieser Datei dokumentiert.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
Versionierung folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.2] - 2025-11-17

### Fixed

- **Dokumentation**: Logo-Dateien (`static/img/`) jetzt in allen Installations-Anleitungen dokumentiert
  - `INSTALL.md` aktualisiert: Dateistruktur zeigt jetzt `static/img/` Ordner mit allen Provider-Logos
  - `README.md` aktualisiert: Quick Start und Dateistruktur zeigen jetzt den `img/` Ordner
  - Checkliste in `INSTALL.md` erweitert um Prüfung der Provider-Logos
  - Behebt Problem, dass Logo-Dateien bei der Installation übersehen werden konnten
  - Ohne diese Dateien werden Provider-Logos (ARTE, YouTube, Vimeo, etc.) nicht angezeigt

---

## [2.0.1] - 2025-11-17

### Fixed

- **Browser-Spracherkennung**: Die automatische Erkennung der Browser-Sprache funktioniert jetzt zuverlässig
  - Hugo-Template setzt `data-embed-consent-language` nur noch, wenn explizit konfiguriert
  - Wenn nicht konfiguriert, erkennt JavaScript automatisch die Browser-Sprache (`navigator.language`)
  - Behebt Problem, dass Consent-Banner immer auf Englisch angezeigt wurden, obwohl Browser auf Deutsch war

### Changed

- **Dokumentation**: README aktualisiert mit Informationen zur automatischen Spracherkennung
  - Neuer Abschnitt "Automatische Spracherkennung" erklärt das Standardverhalten
  - Konfigurationstabelle zeigt jetzt `auto` als Standardwert für `language`

---

## [2.0.0] - 2025-11-17

### 🎉 Major Release: Automatische iframe-Erkennung

**BREAKING CHANGES**: Kompletter Neuansatz - kein Shortcode mehr nötig!

### Added

#### Automatische iframe-Erkennung
- **Automatisches Wrapping**: JavaScript findet und schützt ALLE iframes auf der Seite
- **Provider-Erkennung**: Automatische Erkennung von YouTube, Vimeo, ARTE
- **Null manuelle Arbeit**: Funktioniert mit bestehenden Posts ohne Änderungen
- **MutationObserver**: Unterstützt dynamisch hinzugefügte iframes (SPAs)

#### Neue Konfigurationsmethode
- **Hugo Partial**: `embed-consent-config.html` für Konfiguration via data-attributes
- **Flexible Config-Quellen**: Liest aus meta-tags oder data-attributes
- **Exclude-Selektoren**: `.no-consent` und `[data-no-consent]` zum Ausschließen bestimmter iframes

#### Provider-Icons
- YouTube-Logo im Overlay
- Vimeo-Logo im Overlay
- ARTE-Logo im Overlay
- Generisches Icon für alle anderen iframes

#### Verbesserungen
- **Automatische Aspect-Ratio-Erkennung**: Liest iframe width/height aus
- **Verbesserte Fehlerbehandlung**: Überspringt fehlerhafte iframes gracefully
- **Deutsche README**: Hauptdokumentation jetzt auf Deutsch
- **Vereinfachte Installation**: Nur 3 Schritte statt komplexer Shortcode-Integration

### Changed

- **Kernarchitektur**: Von Shortcode-basiert zu automatischer Erkennung
- **Installation**: Hugo Partial statt Shortcode
- **Dokumentation**: Fokus auf automatischen Modus

### Removed

- **Hugo Shortcode** (`layouts/shortcodes/embed.html`): Nicht mehr nötig
- **EXAMPLES.md**: Obsolet im automatischen Modus
- **Manuelle Shortcode-Parameter**: Alles läuft jetzt automatisch

### Migration von 1.0.0

**Gute Nachricht**: Migration ist einfach!

1. **Alte Shortcodes entfernen**: Nicht mehr nötig (können aber bleiben - werden als normale iframes erkannt)
2. **Partial einbinden**: `{{ partial "embed-consent-config.html" . }}` im `<head>`
3. **Fertig**: Plugin findet automatisch alle iframes

---

## [1.0.0] - 2025-11-17 (Superseded by 2.0.0)

### Initial Release (Shortcode-basiert)

**Diese Version wurde noch am selben Tag durch 2.0.0 ersetzt.**

#### Features (1.0.0)
- Hugo Shortcode für manuelles Embedding
- Consent-Overlay mit LocalStorage
- Internationalisierung (DE/EN)
- YouTube, Vimeo, ARTE, Generic Provider
- Theme-aware Styling
- Dark Mode Support

**Hinweis**: Falls du 1.0.0 verwendest, upgrade auf 2.0.0 - es ist viel einfacher!

---

## Upgrade Guide

### Von 1.0.0 → 2.0.0

#### Schritt 1: Partial hinzufügen

Füge in `layouts/_default/baseof.html` im `<head>` hinzu:

```html
{{ partial "embed-consent-config.html" . }}
```

#### Schritt 2: Shortcodes entfernen (optional)

Alte Shortcodes wie:
```markdown
{{< embed provider="youtube" id="abc123" >}}
```

Können durch normale HTML-iframes ersetzt werden:
```html
<iframe src="https://www.youtube.com/embed/abc123"></iframe>
```

Oder einfach drin lassen - werden als normale iframes erkannt!

#### Schritt 3: Testen

Hugo Server starten und prüfen ob:
- ✅ Consent-Overlay über allen iframes erscheint
- ✅ Provider-Icons angezeigt werden
- ✅ "Inhalt laden" Button funktioniert

**Das wars!**

---

## Roadmap

### [2.1.0] - Geplant

- [ ] Weitere Provider: Twitch, DailyMotion, SoundCloud
- [ ] Thumbnail-Extraktion von Video-Platforms
- [ ] Per-Provider Consent-Einstellungen
- [ ] Erweiterte Exclude-Patterns (RegEx)

### [2.2.0] - Geplant

- [ ] Weitere Sprachen (FR, ES, IT, NL)
- [ ] Animation-Optionen
- [ ] Theme-Presets (light/dark/auto)
- [ ] Performance-Optimierungen

### [3.0.0] - Ideen

- [ ] Cookie Consent Integration
- [ ] Privacy-friendly Analytics
- [ ] Multi-Domain Support
- [ ] WordPress-Version
- [ ] NPM-Package für non-Hugo Sites

---

## Versionshistorie

- **2.0.2** (2025-11-17) - Dokumentations-Fix für Logo-Dateien (AKTUELLE VERSION)
- **2.0.1** (2025-11-17) - Browser-Spracherkennung Fix
- **2.0.0** (2025-11-17) - Automatische iframe-Erkennung
- **1.0.0** (2025-11-17) - Initial Release mit Shortcode (superseded)

---

## Contributing

Bei Änderungen:

1. Diese CHANGELOG unter "Unreleased" aktualisieren
2. Format: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
3. Issue/PR-Nummer angeben falls vorhanden
4. Bei Release Items von "Unreleased" in Version-Section verschieben

---

## Legende

- `Added` - Neue Features
- `Changed` - Änderungen an bestehenden Features
- `Deprecated` - Bald zu entfernende Features
- `Removed` - Entfernte Features
- `Fixed` - Bugfixes
- `Security` - Sicherheits-Patches

**BREAKING CHANGES** werden speziell markiert: ⚠️
