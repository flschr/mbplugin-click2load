# Changelog

All notable changes to the Embed Consent Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-17

### Added

#### Core Features
- Hugo shortcode `embed` with support for YouTube, Vimeo, ARTE, and generic embeds
- Consent-protected loading mechanism (embeds don't load until user consent)
- LocalStorage support for remembering user preferences across visits
- "Always allow" checkbox option for global consent
- Internationalization support (German and English built-in)
- Configurable privacy policy link in consent overlay

#### Shortcode Parameters
- `provider`: Specify embed provider (youtube, vimeo, arte, generic)
- `id`: Video ID for YouTube/Vimeo
- `url`: Full URL for ARTE/generic embeds
- `title`: Iframe title for accessibility
- `ratio`: Aspect ratio support (16/9, 4/3, 1/1, 21/9)
- `thumbnail`: Optional preview image
- `consent_text`: Override default consent text
- `button_label`: Override button text
- `always_allow_label`: Override checkbox text

#### Configuration Options
- `enableLocalStorage`: Enable/disable localStorage persistence
- `showAlwaysAllowOption`: Show/hide "always allow" checkbox
- `language`: Default language (en/de)
- `privacyPolicyUrl`: Optional privacy policy link

#### JavaScript Features
- Automatic embed initialization on DOM ready
- MutationObserver for dynamic content support
- `window.resetEmbedConsent()` - Global function to revoke consent
- `window.getEmbedConsentStatus()` - Check current consent status
- Graceful error handling and console warnings
- Keyboard accessibility support

#### CSS Features
- Responsive aspect ratio containers with fallback
- Theme-aware border-radius (respects CSS custom properties)
- Automatic dark mode support via `prefers-color-scheme`
- Support for `.dark` class and `[data-theme="dark"]` attribute
- Accessible button and checkbox styling
- Print-friendly styles
- Reduced motion support
- Mobile-responsive design

#### Documentation
- Comprehensive README with installation instructions
- Configuration examples (TOML and YAML)
- Usage examples with all parameter combinations
- Troubleshooting guide
- Privacy considerations documentation
- Browser compatibility information

#### Provider Support
- **YouTube**: Uses youtube-nocookie.com domain for privacy
- **Vimeo**: Standard Vimeo player embeds
- **ARTE**: Full support for ARTE media library
- **Generic**: Any iframe-based embed

#### Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader friendly
- No-JavaScript fallback with direct content links
- Meaningful error messages

#### Privacy Features
- No cookies or tracking
- No external requests until consent given
- GDPR compliant (requires explicit user action)
- Optional localStorage-free mode for strict privacy compliance
- User-controlled consent revocation

### Technical Details

#### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge): Full support
- Older browsers: Graceful degradation
- IE11: Basic functionality (with polyfills for aspect-ratio)

#### Performance
- Lazy loading support via `loading="lazy"` attribute
- No dependencies (vanilla JavaScript and CSS)
- Minimal CSS and JS file sizes
- Efficient event delegation
- Mutation observer for SPA compatibility

#### Security
- CSP-friendly implementation
- No inline scripts or styles
- Proper iframe sandboxing attributes
- XSS-safe attribute handling

---

## Future Planned Features

### [1.1.0] - Planned
- [ ] Additional provider support (Twitch, DailyMotion, etc.)
- [ ] Custom provider logos/icons option
- [ ] Animation customization options
- [ ] More language translations (French, Spanish, Italian)

### [1.2.0] - Planned
- [ ] Consent analytics (privacy-friendly, opt-in)
- [ ] Theme presets (light/dark/auto/custom)
- [ ] Advanced aspect ratio calculations
- [ ] Thumbnail auto-generation from video platforms

### [2.0.0] - Ideas
- [ ] Multiple consent zones per page
- [ ] Per-provider consent settings
- [ ] Cookie consent integration
- [ ] WordPress plugin version

---

## Version History

- **1.0.0** (2025-11-17) - Initial release

---

## Upgrade Guide

### From Preview to 1.0.0

This is the initial stable release. No upgrade path needed.

---

## Contributing

When contributing changes, please:

1. Update this CHANGELOG with your changes under "Unreleased"
2. Follow the format: Added, Changed, Deprecated, Removed, Fixed, Security
3. Include the issue/PR number if applicable
4. Move items from "Unreleased" to a version section when releasing

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security-related changes
