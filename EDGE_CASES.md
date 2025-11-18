# Edge Cases - Test Documentation

## Version 2.3.0

Diese Dokumentation beschreibt alle behandelten Edge Cases und wie sie getestet werden können.

---

## 1. Prerendering / Speculation Rules

### Problem
Chrome kann Seiten mit der Speculation Rules API vorab rendern, bevor der User draufklickt. Das könnte iframes laden, bevor die Seite überhaupt sichtbar ist.

### Lösung
- Detection über `document.prerendering` (boolean)
- Event `prerenderingchange` wartet bis Seite aktiviert wird
- iframes werden mit `data-pending-load="true"` markiert und erst nach Prerender-Aktivierung geladen

### Test
```javascript
// In Browser Console (nur Chrome mit Speculation Rules):
console.log('Prerendering:', document.prerendering);

// Beim Prerender sollten iframes NICHT geladen werden
// Nach prerenderingchange Event werden sie nachgeladen
```

### Code-Referenzen
- Status-Tracking: `embed-consent.js:28`
- Event Handler: `embed-consent.js:807-813`
- Load-Prevention: `embed-consent.js:531-538`

---

## 2. Page Visibility API

### Problem
Wenn ein Tab in den Hintergrund geht und zurückkommt, könnten Browser iframes neu initialisieren. Außerdem sollten iframes nicht im Hintergrund geladen werden (Resourcen-Verschwendung).

### Lösung
- `document.hidden` Check vor jedem iframe-Load
- Event `visibilitychange` verarbeitet pending loads wenn Tab wieder sichtbar wird
- Verhindert Background-Loading und spart Bandbreite

### Test
```javascript
// In Browser Console:
console.log('Page visible:', !document.hidden);

// 1. Consent geben während Tab im Hintergrund ist
// 2. Tab wechseln → iframe sollte NICHT laden
// 3. Tab zurückwechseln → iframe sollte jetzt laden
```

### Code-Referenzen
- Status-Tracking: `embed-consent.js:27`
- Event Handler: `embed-consent.js:820-828`
- Load-Prevention: `embed-consent.js:540-547`

---

## 3. Print Preview

### Problem
Bei `window.print()` oder Print-Vorschau könnten Browser iframes neu initialisieren oder laden.

### Lösung
- Events `beforeprint` und `afterprint` tracken Print-Status
- Während Print wird kein Auto-Load durchgeführt
- Bestehende iframes bleiben unverändert

### Test
```javascript
// Im Browser:
// 1. Seite mit Consent-Overlay öffnen
// 2. Strg+P / Cmd+P drücken
// 3. Print Preview sollte Overlay anzeigen, aber NICHT automatisch laden
// 4. Print abbrechen
// 5. Pending loads sollten verarbeitet werden
```

### Code-Referenzen
- Status-Tracking: `embed-consent.js:29`
- Event Handler: `embed-consent.js:835-843`
- Load-Prevention: `embed-consent.js:549-553`

---

## 4. Mobile: Pull-to-Refresh & bfcache

### Problem
Pull-to-Refresh auf Mobile ist ähnlich wie bfcache, aber nicht identisch. Außerdem können bfcache und Visibility State interagieren.

### Lösung
- Bestehender `pageshow` Event Handler für bfcache (event.persisted)
- Kombiniert mit `visibilitychange` für vollständige Abdeckung
- 50ms Timeout nach bfcache-Restore für Edge Case Handling

### Test (Mobile)
```
1. Seite öffnen, Consent geben, iframe laden
2. Zu anderer Seite navigieren
3. Back-Button drücken
   → iframe sollte NICHT mehr geladen sein (kein persistent consent)
   → Overlay sollte wieder da sein

4. "Immer erlauben" aktivieren
5. Schritte 1-3 wiederholen
   → iframe sollte geladen bleiben
```

### Test (Desktop bfcache)
```
1. Seite in Chrome/Firefox öffnen
2. iframe laden (ohne "immer erlauben")
3. Zu anderer Seite navigieren
4. Back-Button
   → iframe sollte zurück im Consent-State sein
```

### Code-Referenzen
- bfcache Handler: `embed-consent.js:850-861`
- bfcache Restore Logic: `embed-consent.js:725-755`

---

## 5. Service Workers

### Problem
Falls die Seite von einem Service Worker aus dem Cache geladen wird, könnten Race Conditions auftreten.

### Lösung
- Robuste Initialisierung mit `document.readyState` Check
- Funktioniert bei `loading`, `interactive` und `complete` States
- MutationObserver fängt nachträglich hinzugefügte iframes

### Test
```javascript
// Service Worker registrieren und Seite cachen:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Nach Cache:
// 1. Seite offline öffnen
// 2. Plugin sollte trotzdem funktionieren
// 3. iframes sollten korrekt gewrappt werden
```

### Code-Referenzen
- Initialisierung: `embed-consent.js:868-872`
- State-Safe: funktioniert bei allen readyState Werten

---

## Combined Edge Cases

### Scenario: Prerender + Hidden Tab
```
1. Seite wird prerendered
2. Tab ist im Hintergrund
3. User klickt Link → prerenderingchange fires
4. Tab ist immer noch hidden
   → iframe sollte NICHT laden (visibility hat Vorrang)
5. User wechselt zu Tab
   → jetzt erst wird iframe geladen
```

### Scenario: bfcache + Print
```
1. Seite mit geladenem iframe
2. Navigation weg → bfcache
3. Back-Button → iframe reset zu Consent
4. Print Preview öffnen
   → Overlay sichtbar, aber kein Auto-Load
```

---

## Implementation Details

### Pending Load Mechanism
Wenn ein iframe aufgrund eines Edge Cases nicht geladen werden kann:
1. `iframe.dataset.pendingLoad = 'true'`
2. `wrapper.dataset.pendingLoad = 'true'`
3. `processPendingLoads()` wird aufgerufen wenn Bedingungen erfüllt sind

### State Tracking
Drei Boolean-Flags tracken den Page-State:
- `isPrerendering` - Page wird gerade prerendered
- `isPageVisible` - Tab ist sichtbar (nicht hidden)
- `isPrinting` - Print Preview ist aktiv

### Load Conditions
Ein iframe wird NUR geladen wenn:
- ✅ `!isPrerendering`
- ✅ `isPageVisible`
- ✅ `!isPrinting`
- ✅ User hat Consent gegeben (oder persistent consent gespeichert)

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Prerendering | ✅ | ❌ | ❌ | ✅ |
| Visibility API | ✅ | ✅ | ✅ | ✅ |
| Print Events | ✅ | ✅ | ✅ | ✅ |
| bfcache | ✅ | ✅ | ✅ | ✅ |
| Service Workers | ✅ | ✅ | ✅ | ✅ |

**Fallback**: Wenn ein Feature nicht unterstützt wird, degradiert das Plugin gracefully:
- `document.prerendering` ist `undefined` → wird als `false` behandelt
- Events werden einfach nicht gefeuert → normales Verhalten
- Alle Edge Case Protections sind Progressive Enhancement

---

## Performance Impact

### Minimal Overhead
- State-Tracking: 3 Boolean-Variablen (vernachlässigbar)
- Event Listeners: 4 zusätzliche (visibilitychange, prerenderingchange, beforeprint, afterprint)
- Pending Loads Processing: O(n) wo n = Anzahl pending iframes (typisch 0-5)

### Positive Impact
- ✅ Verhindert unnötiges Background-Loading
- ✅ Spart Bandbreite bei hidden Tabs
- ✅ Keine doppelten Loads bei bfcache
- ✅ Bessere Resource-Nutzung

---

## Future Considerations

### Possible Additions
1. **Navigation Transitions API** - für view transitions
2. **Background Sync** - für offline scenarios
3. **Network Information API** - Save-Data mode detection

### Monitor
- Neue Prerendering/Speculation APIs in Chrome
- Weitere Mobile-Browser spezifische Verhaltensweisen
- Neue Print-related Events

---

## Changelog

### v2.3.0 (2024-11-18)
- ✅ Added Prerendering detection and handling
- ✅ Added Page Visibility API integration
- ✅ Added Print Preview protection
- ✅ Enhanced bfcache handling with visibility state
- ✅ Improved Service Worker compatibility
- ✅ Added pending load mechanism for deferred loading
