/**
 * Embed Consent Plugin for Hugo / Micro.blog
 *
 * Automatically detects and wraps all iframes with consent overlay.
 * No manual shortcode usage required - works with existing iframes!
 *
 * @version 2.3.0
 *
 * Edge Cases Handled:
 * - Prerendering (Chrome Speculation Rules)
 * - Page Visibility (hidden tabs, mobile scenarios)
 * - Print Preview (beforeprint/afterprint)
 * - bfcache & Pull-to-Refresh
 * - Service Worker cache loads
 */

(function () {
    'use strict';

    // Constants
    const VERSION = '2.3.0';
    const STORAGE_KEY = 'embedConsentAlwaysAllow';
    const DEBOUNCE_DELAY = 150; // ms
    const DEFAULT_ASPECT_RATIO = 56.25; // 16:9 in percentage
    const DEFAULT_ASPECT_RATIO_STRING = '16 / 9';

    // Store observer references for cleanup
    let mutationObserver = null;

    // Cache configuration to avoid repeated DOM queries
    let cachedConfig = null;

    // Track page state for edge cases
    let isPageVisible = !document.hidden;
    let isPrerendering = document.prerendering || false;
    let isPrinting = false;

    // Default configuration
    const DEFAULT_CONFIG = {
        enableLocalStorage: true,
        showAlwaysAllowOption: true,
        language: 'en',
        privacyPolicyUrl: '',
        baseUrl: '', // Base URL for assets (logos)
        providers: {}, // Custom providers
        excludeSelectors: ['.no-consent', '[data-no-consent]']
    };

    // Translations
    const TRANSLATIONS = {
        en: {
            consentText: 'This content is served by an external service. Loading it may send data to third parties under their privacy policy.',
            consentTextWithProvider: 'This content is served by {provider}. Loading it may send data to {provider} under their privacy policy.',
            buttonLabel: 'Load content',
            alwaysAllowLabel: 'Always allow external media on this site.',
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
            consentText: 'Dieses eingebettete Medium stammt von einem externen Anbieter. Beim Laden können Daten an Dritte gemäß deren Datenschutzerklärung übertragen werden.',
            consentTextWithProvider: 'Dieses eingebettete Medium stammt von {provider}. Beim Laden können Daten an {provider} gemäß deren Datenschutzerklärung übertragen werden.',
            buttonLabel: 'Inhalt laden',
            alwaysAllowLabel: 'Externe Inhalte immer erlauben.',
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

    // Use root-relative paths so the icons also load on permalink pages that
    // live under nested URLs like "/2024/11/post/".
    const LOGOS = {
        arte: '/img/Arte-Logo.webp',
        youtube: '/img/YouTube-Logo.png',
        vimeo: '/img/Vimeo-Logo.png',
        komoot: '/img/Komoot-Logo.png',
        googlemaps: '/img/Google_Maps-Logo.png',
        openstreetmap: '/img/OSM-Logo.png'
    };

    // Provider detection patterns
    const PROVIDERS = {
        youtube: {
            patterns: [
                /youtube\.com\/embed\//i,
                /youtube-nocookie\.com\/embed\//i,
                /youtu\.be\//i
            ],
            name: 'YouTube',
            logo: LOGOS.youtube,
            logoWidth: 90,
            logoHeight: 36
        },
        vimeo: {
            patterns: [
                /vimeo\.com\/video\//i,
                /player\.vimeo\.com\/video\//i
            ],
            name: 'Vimeo',
            logo: LOGOS.vimeo
        },
        arte: {
            patterns: [
                /arte\.tv/i,
                /arteapps\.net/i,
                /arteptwebtv\.akamaized\.net/i
            ],
            name: 'ARTE',
            logo: LOGOS.arte,
            logoWidth: 120,
            logoHeight: 30
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
            logo: LOGOS.googlemaps,
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
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce function to limit execution rate
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

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
     * Get configuration from Hugo site params or meta tags (cached)
     */
    function getConfig() {
        // Return cached config if available
        if (cachedConfig) {
            return cachedConfig;
        }

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
            if (root.dataset.embedConsentBaseUrl) {
                config.baseUrl = root.dataset.embedConsentBaseUrl;
            }
        }

        // Allow global override via window object (useful for custom providers)
        if (window.EmbedConsentConfig) {
            Object.assign(config, window.EmbedConsentConfig);
        }

        // Cache the configuration
        cachedConfig = config;
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
    function detectProvider(src, config) {
        if (!src) return 'generic';

        // Check custom providers first
        if (config.providers) {
            for (const [provider, providerConfig] of Object.entries(config.providers)) {
                if (providerConfig.patterns) {
                    for (const pattern of providerConfig.patterns) {
                        if (pattern.test(src)) {
                            return provider;
                        }
                    }
                }
            }
        }

        // Check built-in providers
        for (const [provider, providerConfig] of Object.entries(PROVIDERS)) {
            for (const pattern of providerConfig.patterns) {
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
    function getProviderName(provider, config) {
        // Check custom providers first
        if (config.providers && config.providers[provider] && config.providers[provider].name) {
            return config.providers[provider].name;
        }

        const translations = TRANSLATIONS[config.language] || TRANSLATIONS.en;
        const key = 'provider' + provider.charAt(0).toUpperCase() + provider.slice(1);
        return translations[key] || PROVIDERS[provider]?.name || translations.providerGeneric;
    }

    /**
     * Create consent overlay HTML
     */
    function createOverlay(provider, config, translations) {
        const providerName = getProviderName(provider, config);
        // Logo handling moved to below

        // Use provider-specific text if we know the provider, otherwise use generic text
        let consentText = translations.consentText;
        if (provider !== 'generic' && translations.consentTextWithProvider) {
            consentText = translations.consentTextWithProvider.replace(/{provider}/g, providerName);
        }

        let privacyLink = '';
        if (config.privacyPolicyUrl) {
            privacyLink = `<br><a href="${escapeHtml(config.privacyPolicyUrl)}" class="embed-consent-privacy-link">${escapeHtml(translations.learnMore)}</a>`;
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

        // Check custom providers first
        let customLogo = config.providers && config.providers[provider] && config.providers[provider].logo;

        // Then built-in providers
        let builtInLogo = PROVIDERS[provider]?.logo;

        let logoSrc = customLogo || builtInLogo;

        if (logoSrc) {
            // Prepend base URL if it's a relative path and not a data URI
            if (config.baseUrl && !logoSrc.startsWith('http') && !logoSrc.startsWith('data:')) {
                // Remove leading slash if present to avoid double slashes when joining
                const cleanBase = config.baseUrl.replace(/\/$/, '');
                const cleanPath = logoSrc.startsWith('/') ? logoSrc : '/' + logoSrc;
                logoSrc = cleanBase + cleanPath;
            }

            const logoWidth = (config.providers && config.providers[provider]?.logoWidth) || PROVIDERS[provider]?.logoWidth || 100;
            const logoHeight = (config.providers && config.providers[provider]?.logoHeight) || PROVIDERS[provider]?.logoHeight || 40;
            logoHtml = `<img src="${logoSrc}" alt="${providerName} Logo" width="${logoWidth}" height="${logoHeight}">`;
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
     * Calculate dimensions for iframe
     */
    function calculateDimensions(iframe) {
        const dimensions = {
            width: getNumericValue(iframe.getAttribute('width'), null),
            height: getNumericValue(iframe.getAttribute('height'), null)
        };

        // If we couldn't get numeric values from attributes, try computed dimensions
        if (!dimensions.width || !dimensions.height) {
            const computed = iframe.getBoundingClientRect();
            if (!dimensions.width && computed.width > 0) {
                dimensions.width = computed.width;
            }
            if (!dimensions.height && computed.height > 0) {
                dimensions.height = computed.height;
            }
        }

        return dimensions;
    }

    /**
     * Configure wrapper aspect ratio based on iframe dimensions
     * Consolidated function to reduce code duplication
     */
    /**
     * Configure wrapper aspect ratio based on iframe dimensions
     * Consolidated function to reduce code duplication
     */
    function configureAspectRatio(wrapper, iframe, preCalculatedDimensions = null) {
        const dimensions = preCalculatedDimensions || calculateDimensions(iframe);
        const hasHeight = dimensions.height;
        const hasWidth = dimensions.width;

        if (hasHeight && !hasWidth) {
            // Fixed height mode (e.g., maps)
            wrapper.style.setProperty('--fixed-iframe-height', dimensions.height + 'px');
            wrapper.classList.add('embed-consent-fixed-height');
            wrapper.dataset.hasAspectRatio = 'false';
        } else if (hasWidth && hasHeight) {
            // Dynamic aspect ratio from dimensions
            const aspectRatio = (dimensions.height / dimensions.width) * 100;
            wrapper.style.setProperty('--aspect-ratio-padding', aspectRatio + '%');
            wrapper.style.setProperty('--iframe-aspect-ratio', dimensions.width + ' / ' + dimensions.height);
            wrapper.dataset.hasAspectRatio = 'true';
        } else {
            // Default 16:9 aspect ratio
            wrapper.style.setProperty('--aspect-ratio-padding', DEFAULT_ASPECT_RATIO + '%');
            wrapper.style.setProperty('--iframe-aspect-ratio', DEFAULT_ASPECT_RATIO_STRING);
            wrapper.dataset.hasAspectRatio = 'false';
        }
    }

    /**
     * Wrap an iframe with consent overlay
     */
    /**
     * Check if iframe should be wrapped
     */
    function canWrapIframe(iframe, config) {
        // Skip if already wrapped or processed
        if (iframe.closest('.embed-consent-wrapper') || iframe.dataset.consentProcessed === 'true') {
            return false;
        }

        // Skip if matches exclude selector
        for (const selector of config.excludeSelectors) {
            if (iframe.matches(selector)) {
                return false;
            }
        }

        // Check for src
        const src = iframe.src || iframe.dataset.src || iframe.dataset.consentSrc;
        if (!src) {
            return false;
        }

        return true;
    }

    /**
     * Wrap an iframe with consent overlay
     */
    function wrapIframe(iframe, config, preCalculatedDimensions = null) {
        if (!canWrapIframe(iframe, config)) {
            return;
        }

        // Check for src in multiple places (re-check needed for extraction)
        const src = iframe.src || iframe.dataset.src || iframe.dataset.consentSrc;

        // Check if iframe is already in a no-JS wrapper from early blocker
        const noJsWrapper = iframe.closest('.embed-consent-nojs-wrapper');
        if (noJsWrapper) {
            // Remove the no-JS wrapper since we'll create the proper wrapper
            const parent = noJsWrapper.parentNode;
            parent.insertBefore(iframe, noJsWrapper);
            noJsWrapper.remove();
        }

        // Mark as processed to prevent race conditions
        iframe.dataset.consentProcessed = 'true';

        const provider = detectProvider(src, config);
        const translations = TRANSLATIONS[config.language] || TRANSLATIONS.en;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'embed-consent-wrapper';
        wrapper.dataset.provider = provider;

        // Configure aspect ratio (refactored logic)
        configureAspectRatio(wrapper, iframe, preCalculatedDimensions);

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
            button.addEventListener('click', function (e) {
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

        // Edge Case: Don't load if page is being prerendered
        // Wait until page is actually shown to user
        if (isPrerendering) {
            // Store for later loading when prerender completes
            iframe.dataset.pendingLoad = 'true';
            wrapper.dataset.pendingLoad = 'true';
            return;
        }

        // Edge Case: Don't load if page is hidden (tab in background)
        // This prevents background loading and saves resources
        if (!isPageVisible) {
            // Store for later loading when page becomes visible
            iframe.dataset.pendingLoad = 'true';
            wrapper.dataset.pendingLoad = 'true';
            return;
        }

        // Edge Case: Don't auto-load during print preview
        // Let browser handle existing iframe state
        if (isPrinting) {
            return;
        }

        // Clear pending load flag if set
        delete iframe.dataset.pendingLoad;
        delete wrapper.dataset.pendingLoad;

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
     * Process pending iframe loads
     * Called when page becomes visible or prerendering completes
     */
    function processPendingLoads() {
        // Don't process if conditions aren't met
        if (isPrerendering || !isPageVisible || isPrinting) {
            return;
        }

        const pendingWrappers = document.querySelectorAll('.embed-consent-wrapper[data-pending-load="true"]');

        for (const wrapper of pendingWrappers) {
            const iframe = wrapper.querySelector('iframe[data-pending-load="true"]');
            if (iframe && iframe.dataset.consentSrc) {
                loadIframe(wrapper, iframe);
            }
        }
    }

    /**
     * Process all iframes on the page
     */
    /**
     * Process all iframes on the page
     * Optimized to batch DOM reads and writes
     */
    function processAllIframes() {
        const config = getConfig();
        const iframes = document.querySelectorAll('iframe');
        const toWrap = [];

        // Read phase: Identify candidates and measure dimensions
        for (const iframe of iframes) {
            try {
                if (canWrapIframe(iframe, config)) {
                    toWrap.push({
                        iframe: iframe,
                        dimensions: calculateDimensions(iframe)
                    });
                }
            } catch (error) {
                console.error('Failed to check iframe:', error);
            }
        }

        // Write phase: Apply wrappers
        for (const item of toWrap) {
            try {
                wrapIframe(item.iframe, config, item.dimensions);
            } catch (error) {
                console.error('Failed to wrap iframe:', error);
            }
        }
    }

    /**
     * Process only newly added iframes (optimized for performance)
     */
    /**
     * Process only newly added iframes (optimized for performance)
     */
    function processNewIframes(addedNodes) {
        const config = getConfig();
        const candidates = [];

        // Collect candidates
        for (const node of addedNodes) {
            if (node.nodeType !== 1) continue; // Skip non-element nodes

            try {
                // Check if the node itself is an iframe
                if (node.tagName === 'IFRAME') {
                    candidates.push(node);
                }
                // Check if the node contains iframes
                else if (node.querySelectorAll) {
                    const iframes = node.querySelectorAll('iframe');
                    for (const iframe of iframes) {
                        candidates.push(iframe);
                    }
                }
            } catch (error) {
                console.error('Failed to find iframes:', error);
            }
        }

        if (candidates.length === 0) return;

        const toWrap = [];

        // Read phase
        for (const iframe of candidates) {
            if (canWrapIframe(iframe, config)) {
                toWrap.push({
                    iframe: iframe,
                    dimensions: calculateDimensions(iframe)
                });
            }
        }

        // Write phase
        for (const item of toWrap) {
            wrapIframe(item.iframe, config, item.dimensions);
        }
    }

    /**
     * Show notification toast (better UX than alert)
     */
    function showNotification(message, type) {
        // For now, use console instead of intrusive alerts
        // Can be extended with custom toast UI later
        const prefix = type === 'info' ? 'ℹ️' : type === 'success' ? '✓' : '⚠';
        console.log(`${prefix} Embed Consent: ${message}`);

        // Return message for programmatic use
        return message;
    }

    /**
     * Cleanup function to prevent memory leaks
     */
    function cleanup() {
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
    }

    /**
     * Public API - Global namespace for embed consent functions
     */
    window.EmbedConsent = {
        /**
         * Reset consent preference
         */
        reset: function () {
            if (!isLocalStorageAvailable()) {
                const msg = 'LocalStorage is not available in your browser.';
                showNotification(msg, 'warning');
                return { success: false, message: msg };
            }

            const config = getConfig();
            const hadConsent = getStoredConsent();
            saveConsent(false);

            let message;
            if (hadConsent) {
                message = config.language === 'de'
                    ? 'Die Einwilligung für externe Medien wurde zurückgesetzt. Bitte laden Sie die Seite neu.'
                    : 'Embed consent preference has been reset. Please reload the page.';
                showNotification(message, 'success');
            } else {
                message = config.language === 'de'
                    ? 'Es war keine Einwilligung gespeichert.'
                    : 'No consent preference was stored.';
                showNotification(message, 'info');
            }

            return { success: true, hadConsent: hadConsent, message: message };
        },

        /**
         * Get current consent status
         */
        getStatus: function () {
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
        },

        /**
         * Cleanup observers and listeners
         */
        cleanup: cleanup,

        /**
         * Get plugin version
         */
        version: VERSION
    };

    /**
     * Handle bfcache restore (back/forward navigation)
     * Reset loaded iframes to consent state if no persistent consent is given
     */
    function handleBfcacheRestore() {
        const config = getConfig();

        // If user has given persistent consent, allow all iframes to stay loaded
        if (config.enableLocalStorage && getStoredConsent()) {
            return;
        }

        // Otherwise, reset all active iframes back to consent state
        const wrappers = document.querySelectorAll('.embed-consent-wrapper.embed-consent-active');

        for (const wrapper of wrappers) {
            const iframe = wrapper.querySelector('iframe');
            const overlay = wrapper.querySelector('.embed-consent-overlay');

            if (!iframe) continue;

            // Remove the active class
            wrapper.classList.remove('embed-consent-active');

            // Block the iframe again by removing src
            if (iframe.src && iframe.dataset.consentSrc) {
                iframe.removeAttribute('src');
            }

            // Show the overlay again
            if (overlay) {
                overlay.style.display = '';
            }
        }
    }

    /**
     * Initialize plugin
     */
    function initialize() {
        // Cleanup the early blocker observer (from head script) to avoid duplicate observers
        if (typeof window.__embedConsentCleanupEarlyBlocker === 'function') {
            window.__embedConsentCleanupEarlyBlocker();
        }

        processAllIframes();

        // Watch for new iframes added dynamically (optimized with debouncing)
        if (typeof MutationObserver !== 'undefined') {
            // Create debounced handler for better performance
            const debouncedHandler = debounce(function (mutations) {
                const addedNodes = [];

                // Collect all added element nodes efficiently
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            // Only add if it's an iframe or contains one
                            if (node.tagName === 'IFRAME' || (node.querySelector && node.querySelector('iframe'))) {
                                addedNodes.push(node);
                            }
                        }
                    }
                }

                if (addedNodes.length > 0) {
                    processNewIframes(addedNodes);
                }
            }, DEBOUNCE_DELAY);

            mutationObserver = new MutationObserver(debouncedHandler);

            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Edge Case: Handle Prerendering
     * Chrome Speculation Rules can prerender pages before user clicks
     * We must wait until page is actually shown to load iframes
     */
    if (document.prerendering) {
        document.addEventListener('prerenderingchange', function () {
            isPrerendering = false;
            // Process any iframes that were waiting for prerender to complete
            processPendingLoads();
        }, { once: true });
    }

    /**
     * Edge Case: Handle Page Visibility Changes
     * Prevents iframe loading when tab is in background
     * Also handles mobile pull-to-refresh scenarios
     */
    document.addEventListener('visibilitychange', function () {
        const wasVisible = isPageVisible;
        isPageVisible = !document.hidden;

        // If page just became visible, process pending loads
        if (!wasVisible && isPageVisible) {
            processPendingLoads();
        }
    });

    /**
     * Edge Case: Handle Print Preview
     * Prevents unwanted iframe loading during print
     * Some browsers re-initialize iframes in print preview
     */
    window.addEventListener('beforeprint', function () {
        isPrinting = true;
    });

    window.addEventListener('afterprint', function () {
        isPrinting = false;
        // Process any pending loads after print is done
        processPendingLoads();
    });

    /**
     * Edge Case: Handle bfcache (back/forward cache) restoration
     * This prevents iframes from auto-loading when navigating back
     * Also handles mobile pull-to-refresh in combination with visibilitychange
     */
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            // Page was restored from bfcache (back/forward navigation)
            handleBfcacheRestore();

            // After restoring, process pending loads if conditions are met
            // This handles edge cases where bfcache + visibility state interact
            setTimeout(function () {
                processPendingLoads();
            }, 50);
        }
    });

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
