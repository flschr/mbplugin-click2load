/**
 * Embed Consent Plugin for Hugo / Micro.blog
 *
 * Automatically detects and wraps all iframes with consent overlay.
 * No manual shortcode usage required - works with existing iframes!
 *
 * @version 2.0.1
 */

(function() {
    'use strict';

    // LocalStorage key for the global preference
    const STORAGE_KEY = 'embedConsentAlwaysAllow';

    // Default configuration
    const DEFAULT_CONFIG = {
        enableLocalStorage: true,
        showAlwaysAllowOption: true,
        language: 'en',
        privacyPolicyUrl: '',
        excludeSelectors: ['.no-consent', '[data-no-consent]']
    };

    // Translations
    const TRANSLATIONS = {
        en: {
            consentText: 'This embedded content is provided by an external service. By loading this content, data will be transmitted to third parties. The privacy policy of the external service applies.',
            consentTextWithProvider: 'This embedded content is provided by {provider}. By loading this content, data will be transmitted to {provider}. The privacy policy of {provider} applies.',
            buttonLabel: 'Load content',
            alwaysAllowLabel: 'Always allow external media on this site',
            learnMore: 'Learn more',
            providerYouTube: 'YouTube',
            providerVimeo: 'Vimeo',
            providerArte: 'ARTE',
            providerKomoot: 'Komoot',
            providerGooglemaps: 'Google Maps',
            providerOpenstreetmap: 'OpenStreetMap',
            providerGeneric: 'External Content'
        },
        de: {
            consentText: 'Dieses eingebettete Medium wird von einem externen Anbieter bereitgestellt. Durch das Laden dieses Inhalts werden Daten an Dritte übertragen. Es gilt die Datenschutzvereinbarung des externen Anbieters.',
            consentTextWithProvider: 'Dieses eingebettete Medium wird von {provider} bereitgestellt. Durch das Laden dieses Inhalts werden Daten an {provider} übertragen. Es gilt die Datenschutzvereinbarung von {provider}.',
            buttonLabel: 'Inhalt laden',
            alwaysAllowLabel: 'Externe Medien auf dieser Website immer erlauben',
            learnMore: 'Mehr erfahren',
            providerYouTube: 'YouTube',
            providerVimeo: 'Vimeo',
            providerArte: 'ARTE',
            providerKomoot: 'Komoot',
            providerGooglemaps: 'Google Maps',
            providerOpenstreetmap: 'OpenStreetMap',
            providerGeneric: 'Externer Inhalt'
        }
    };

    const LOGOS = {
        arte: 'img/ARTE-Logo.png',
        komoot: 'img/Komoot-Logo.png',
        openstreetmap: 'img/OSM-Logo.png'
    };

    /**
     * Determine the base URL for plugin assets based on the current script tag
     */
    function getScriptBaseUrl() {
        const scripts = document.getElementsByTagName('script');

        for (let i = scripts.length - 1; i >= 0; i--) {
            const script = scripts[i];
            if (script && script.src && script.src.includes('embed-consent')) {
                try {
                    const scriptUrl = new URL(script.src, window.location.href);
                    scriptUrl.search = '';
                    scriptUrl.hash = '';
                    scriptUrl.pathname = scriptUrl.pathname.replace(/js\/embed-consent\.js.*$/, '');
                    if (!scriptUrl.pathname.endsWith('/')) {
                        scriptUrl.pathname += '/';
                    }
                    return scriptUrl;
                } catch (error) {
                    console.warn('Failed to parse embed consent script URL:', error);
                }
            }
        }

        try {
            return new URL('.', window.location.href);
        } catch (error) {
            return new URL(window.location.href);
        }
    }

    const SCRIPT_BASE_URL = getScriptBaseUrl();

    /**
     * Convert a relative asset path into an absolute URL
     */
    function resolveAssetPath(path) {
        if (!path) {
            return null;
        }

        if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) {
            return path;
        }

        try {
            if (path.startsWith('/')) {
                return new URL(path, window.location.href).toString();
            }

            return new URL(path, SCRIPT_BASE_URL).toString();
        } catch (error) {
            console.warn('Failed to resolve embed consent asset path:', path, error);
            return path;
        }
    }

    // Provider detection patterns
    const PROVIDERS = {
        youtube: {
            patterns: [
                /youtube\.com\/embed\//i,
                /youtube-nocookie\.com\/embed\//i,
                /youtu\.be\//i
            ],
            name: 'YouTube',
            logo: 'img/YouTube-Logo.png',
            logoWidth: 90,
            logoHeight: 36
        },
        vimeo: {
            patterns: [
                /vimeo\.com\/video\//i,
                /player\.vimeo\.com\/video\//i
            ],
            name: 'Vimeo',
            logo: 'img/Vimeo-Logo.png'
        },
        arte: {
            patterns: [
                /arte\.tv/i,
                /arteapps\.net/i,
                /arteptwebtv\.akamaized\.net/i
            ],
            name: 'ARTE',
            logo: LOGOS.arte
        },
        komoot: {
            patterns: [
                /komoot\.(?:de|com)/i,
                /komootcdn\.com/i
            ],
            name: 'Komoot',
            logo: LOGOS.komoot
        },
        googlemaps: {
            patterns: [
                /google\.[^/]+\/maps/i,
                /maps\.googleapis\.com/i,
                /googleusercontent\.com\/maps/i
            ],
            name: 'Google Maps',
            logo: 'img/Google_Maps-Logo.png',
            logoWidth: 90,
            logoHeight: 36
        },
        openstreetmap: {
            patterns: [
                /openstreetmap\.org/i,
                /osm\.org/i
            ],
            name: 'OpenStreetMap',
            logo: LOGOS.openstreetmap
        },
        generic: {
            patterns: [],
            name: 'External',
            logo: null
        }
    };

    /**
     * Detect browser language and return supported language code
     */
    function detectBrowserLanguage() {
        // Get browser language (e.g., 'de-DE', 'en-US', 'de', 'en')
        const browserLang = navigator.language || navigator.userLanguage || '';

        // Extract language code (first two characters)
        const langCode = browserLang.toLowerCase().substring(0, 2);

        // Return language if we have translations for it, otherwise default to English
        return TRANSLATIONS[langCode] ? langCode : 'en';
    }

    /**
     * Get configuration from Hugo site params or meta tags
     */
    function getConfig() {
        const config = Object.assign({}, DEFAULT_CONFIG);

        // Detect and use browser language as default
        config.language = detectBrowserLanguage();

        // Try to read from meta tags
        const metaConfig = document.querySelector('meta[name="embed-consent-config"]');
        if (metaConfig) {
            try {
                const dataConfig = JSON.parse(metaConfig.content);
                Object.assign(config, dataConfig);
            } catch (e) {
                console.warn('Failed to parse embed consent config:', e);
            }
        }

        // Try to read from data attributes on body or html
        const root = document.documentElement || document.body;
        if (root) {
            if (root.dataset.embedConsentStorage !== undefined) {
                config.enableLocalStorage = root.dataset.embedConsentStorage !== 'false';
            }
            if (root.dataset.embedConsentAlwaysAllow !== undefined) {
                config.showAlwaysAllowOption = root.dataset.embedConsentAlwaysAllow !== 'false';
            }
            if (root.dataset.embedConsentLanguage) {
                config.language = root.dataset.embedConsentLanguage;
            }
            if (root.dataset.embedConsentPrivacyUrl) {
                config.privacyPolicyUrl = root.dataset.embedConsentPrivacyUrl;
            }
        }

        return config;
    }

    /**
     * Check if localStorage is available
     */
    function isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get stored consent preference
     */
    function getStoredConsent() {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    /**
     * Save consent preference
     */
    function saveConsent(value) {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        try {
            if (value) {
                localStorage.setItem(STORAGE_KEY, 'true');
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
            return true;
        } catch (e) {
            console.warn('Failed to save embed consent preference:', e);
            return false;
        }
    }

    /**
     * Detect provider from iframe src
     */
    function detectProvider(src) {
        if (!src) return 'generic';

        for (const [provider, config] of Object.entries(PROVIDERS)) {
            for (const pattern of config.patterns) {
                if (pattern.test(src)) {
                    return provider;
                }
            }
        }

        return 'generic';
    }

    /**
     * Get provider display name
     */
    function getProviderName(provider, lang) {
        const translations = TRANSLATIONS[lang] || TRANSLATIONS.en;
        const key = 'provider' + provider.charAt(0).toUpperCase() + provider.slice(1);
        return translations[key] || PROVIDERS[provider]?.name || translations.providerGeneric;
    }

    /**
     * Create consent overlay HTML
     */
    function createOverlay(provider, config, translations) {
        const providerName = getProviderName(provider, config.language);
        const providerLogo = resolveAssetPath(PROVIDERS[provider]?.logo);

        // Use provider-specific text if we know the provider, otherwise use generic text
        let consentText = translations.consentText;
        if (provider !== 'generic' && translations.consentTextWithProvider) {
            consentText = translations.consentTextWithProvider.replace(/{provider}/g, providerName);
        }

        let privacyLink = '';
        if (config.privacyPolicyUrl) {
            privacyLink = `<br><a href="${config.privacyPolicyUrl}" class="embed-consent-privacy-link">${translations.learnMore}</a>`;
        }

        let checkboxHtml = '';
        if (config.enableLocalStorage && config.showAlwaysAllowOption) {
            checkboxHtml = `
                <label class="embed-consent-checkbox">
                    <input type="checkbox" class="embed-consent-checkbox-input">
                    <span class="embed-consent-checkbox-label">${translations.alwaysAllowLabel}</span>
                </label>
            `;
        }

        let logoHtml = '';
        if (providerLogo) {
            const logoWidth = PROVIDERS[provider]?.logoWidth || 120;
            const logoHeight = PROVIDERS[provider]?.logoHeight || 48;
            logoHtml = `<img src="${providerLogo}" alt="${providerName} Logo" width="${logoWidth}" height="${logoHeight}">`;
        }

        return `
            <div class="embed-consent-overlay">
                <div class="embed-consent-content">
                    <div class="embed-consent-icon">
                        ${logoHtml}
                    </div>
                    <p class="embed-consent-text">
                        ${consentText}
                        ${privacyLink}
                    </p>
                    <div class="embed-consent-actions">
                        ${checkboxHtml}
                        <button type="button" class="embed-consent-button">
                            ${translations.buttonLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get numeric value from attribute or computed style
     */
    function getNumericValue(value, fallback) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            // Ignore percentage values
            if (value.includes('%')) {
                return fallback;
            }
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }
        return fallback;
    }

    /**
     * Wrap an iframe with consent overlay
     */
    function wrapIframe(iframe, config) {
        // Skip if already wrapped
        if (iframe.closest('.embed-consent-wrapper')) {
            return;
        }

        // Skip if matches exclude selector
        for (const selector of config.excludeSelectors) {
            if (iframe.matches(selector)) {
                return;
            }
        }

        // Check for src in multiple places:
        // 1. iframe.src - normal src attribute
        // 2. iframe.dataset.src - data-src attribute (lazy loading)
        // 3. iframe.dataset.consentSrc - already blocked by early script
        const src = iframe.src || iframe.dataset.src || iframe.dataset.consentSrc;
        if (!src) {
            return; // No src to load
        }

        const provider = detectProvider(src);
        const translations = TRANSLATIONS[config.language] || TRANSLATIONS.en;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'embed-consent-wrapper';
        wrapper.dataset.provider = provider;

        // Get dimensions for aspect ratio
        // Extract numeric values from width and height attributes
        const widthAttr = iframe.getAttribute('width');
        const heightAttr = iframe.getAttribute('height');

        const widthAttrValue = getNumericValue(widthAttr, null);
        const heightAttrValue = getNumericValue(heightAttr, null);

        let width = widthAttrValue;
        let height = heightAttrValue;

        // If an explicit height is set but no valid width exists, we should
        // respect the fixed height instead of forcing a 16:9 aspect ratio.
        const prefersFixedHeight = Boolean(heightAttrValue && widthAttrValue === null);

        // If we couldn't get numeric values from attributes, try computed dimensions
        if (!width || !height) {
            const computed = iframe.getBoundingClientRect();
            if (!width && computed.width > 0) {
                width = computed.width;
            }
            if (!height && computed.height > 0) {
                height = computed.height;
            }
        }

        const hasAspectRatio = Boolean(!prefersFixedHeight && width && height);

        if (hasAspectRatio) {
            const aspectRatio = (height / width) * 100;
            wrapper.style.setProperty('--aspect-ratio-padding', aspectRatio + '%');
            wrapper.style.setProperty('--iframe-aspect-ratio', width + ' / ' + height);
            wrapper.dataset.hasAspectRatio = 'true';
        } else if (prefersFixedHeight && height) {
            wrapper.style.setProperty('--fixed-iframe-height', height + 'px');
            wrapper.classList.add('embed-consent-fixed-height');
            wrapper.dataset.hasAspectRatio = 'false';
        } else {
            // Fallback to 16:9 for the overlay display
            wrapper.style.setProperty('--aspect-ratio-padding', '56.25%');
            wrapper.style.setProperty('--iframe-aspect-ratio', '16 / 9');
            wrapper.dataset.hasAspectRatio = 'false';
        }

        // Store original src and remove it (if not already done by early blocker script)
        if (!iframe.dataset.consentSrc) {
            iframe.dataset.consentSrc = src;
        }
        if (iframe.hasAttribute('src')) {
            iframe.removeAttribute('src');
        }

        // Add iframe class for styling
        iframe.classList.add('embed-consent-iframe');

        // Insert wrapper before iframe
        iframe.parentNode.insertBefore(wrapper, iframe);

        // Move iframe into wrapper
        wrapper.appendChild(iframe);

        // Add overlay
        const overlayHtml = createOverlay(provider, config, translations);
        wrapper.insertAdjacentHTML('afterbegin', overlayHtml);

        // Get overlay elements
        const overlay = wrapper.querySelector('.embed-consent-overlay');
        const button = wrapper.querySelector('.embed-consent-button');
        const checkbox = wrapper.querySelector('.embed-consent-checkbox-input');

        // Check if we should auto-load
        if (config.enableLocalStorage && getStoredConsent()) {
            loadIframe(wrapper, iframe);
            return;
        }

        // Handle button click
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                // Save preference if checkbox is checked
                if (config.enableLocalStorage && config.showAlwaysAllowOption && checkbox && checkbox.checked) {
                    saveConsent(true);
                }

                // Load the iframe
                loadIframe(wrapper, iframe);
            });
        }
    }

    /**
     * Load an iframe by restoring its src
     */
    function loadIframe(wrapper, iframe) {
        const src = iframe.dataset.consentSrc;
        if (!src) {
            console.warn('No consent src found for iframe');
            return;
        }

        // Restore src
        iframe.src = src;

        // Mark wrapper as active
        wrapper.classList.add('embed-consent-active');

        // Hide overlay
        const overlay = wrapper.querySelector('.embed-consent-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Process all iframes on the page
     */
    function processAllIframes() {
        const config = getConfig();
        const iframes = document.querySelectorAll('iframe');

        iframes.forEach(function(iframe) {
            try {
                wrapIframe(iframe, config);
            } catch (error) {
                console.error('Failed to wrap iframe:', error);
            }
        });
    }

    /**
     * Global function to reset consent
     */
    window.resetEmbedConsent = function() {
        if (!isLocalStorageAvailable()) {
            alert('LocalStorage is not available in your browser.');
            return false;
        }

        const config = getConfig();
        const translations = TRANSLATIONS[config.language] || TRANSLATIONS.en;
        const hadConsent = getStoredConsent();
        saveConsent(false);

        if (hadConsent) {
            const message = config.language === 'de'
                ? 'Die Einwilligung für externe Medien wurde zurückgesetzt. Bitte laden Sie die Seite neu.'
                : 'Embed consent preference has been reset. Please reload the page.';
            alert(message);
        } else {
            const message = config.language === 'de'
                ? 'Es war keine Einwilligung gespeichert.'
                : 'No consent preference was stored.';
            alert(message);
        }

        return true;
    };

    /**
     * Global function to check consent status
     */
    window.getEmbedConsentStatus = function() {
        if (!isLocalStorageAvailable()) {
            return {
                available: false,
                consent: false,
                message: 'LocalStorage is not available'
            };
        }

        const consent = getStoredConsent();
        return {
            available: true,
            consent: consent,
            message: consent ? 'Embeds will load automatically' : 'Consent required for each embed'
        };
    };

    /**
     * Initialize plugin
     */
    function initialize() {
        processAllIframes();

        // Watch for new iframes added dynamically
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                let hasNewIframes = false;

                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'IFRAME') {
                                hasNewIframes = true;
                            } else if (node.querySelector && node.querySelector('iframe')) {
                                hasNewIframes = true;
                            }
                        }
                    });
                });

                if (hasNewIframes) {
                    setTimeout(processAllIframes, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
