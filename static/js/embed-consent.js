/**
 * Embed Consent Plugin for Hugo / Micro.blog
 *
 * Automatically detects and wraps all iframes with consent overlay.
 * No manual shortcode usage required - works with existing iframes!
 *
 * @version 2.0.0
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
            consentText: 'This embedded content is provided by an external service. By loading this content, data will be transmitted to third parties.',
            buttonLabel: 'Load content',
            alwaysAllowLabel: 'Always allow external media on this site',
            learnMore: 'Learn more',
            providerYouTube: 'YouTube',
            providerVimeo: 'Vimeo',
            providerArte: 'ARTE',
            providerGeneric: 'External Content'
        },
        de: {
            consentText: 'Dieses eingebettete Medium wird von einem externen Anbieter bereitgestellt. Durch das Laden dieses Inhalts werden Daten an Dritte übertragen.',
            buttonLabel: 'Inhalt laden',
            alwaysAllowLabel: 'Externe Medien auf dieser Website immer erlauben',
            learnMore: 'Mehr erfahren',
            providerYouTube: 'YouTube',
            providerVimeo: 'Vimeo',
            providerArte: 'ARTE',
            providerGeneric: 'Externer Inhalt'
        }
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
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
        },
        vimeo: {
            patterns: [
                /vimeo\.com\/video\//i,
                /player\.vimeo\.com\/video\//i
            ],
            name: 'Vimeo',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>'
        },
        arte: {
            patterns: [
                /arte\.tv\/player\//i
            ],
            name: 'ARTE',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>'
        },
        generic: {
            patterns: [],
            name: 'External',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>'
        }
    };

    /**
     * Get configuration from Hugo site params or meta tags
     */
    function getConfig() {
        const config = Object.assign({}, DEFAULT_CONFIG);

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
        const providerIcon = PROVIDERS[provider]?.icon || PROVIDERS.generic.icon;

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

        return `
            <div class="embed-consent-overlay">
                <div class="embed-consent-content">
                    <div class="embed-consent-icon">
                        ${providerIcon}
                    </div>
                    <p class="embed-consent-text">
                        <strong>${providerName}</strong><br>
                        ${translations.consentText}
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

        const src = iframe.src || iframe.dataset.src;
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

        let width = getNumericValue(widthAttr, null);
        let height = getNumericValue(heightAttr, null);

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

        // Final fallback to 16:9 aspect ratio
        if (!width) width = 640;
        if (!height) height = 360;

        const aspectRatio = (height / width) * 100;
        wrapper.style.setProperty('--aspect-ratio-padding', aspectRatio + '%');
        wrapper.style.setProperty('--iframe-aspect-ratio', width + ' / ' + height);

        // Store original src and remove it
        iframe.dataset.consentSrc = src;
        iframe.removeAttribute('src');

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
