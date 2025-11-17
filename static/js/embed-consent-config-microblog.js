/**
 * Embed Consent Configuration for Micro.blog
 *
 * This file provides configuration for Micro.blog users who cannot modify theme files.
 * It runs before the main plugin and sets configuration via data attributes.
 *
 * For Micro.blog: This file is loaded automatically from the plugin.
 * For Hugo: Use the partial "embed-consent-config.html" instead.
 */

(function() {
    'use strict';

    // Default configuration (matches plugin.json defaults)
    var defaultConfig = {
        enableLocalStorage: true,
        showAlwaysAllowOption: true,
        language: '', // Empty = auto-detect
        privacyPolicyUrl: ''
    };

    // Try to read configuration from multiple sources
    var config = Object.assign({}, defaultConfig);

    // Method 1: Check if Hugo params were injected via inline script
    if (typeof window.embedConsentPluginConfig !== 'undefined') {
        Object.assign(config, window.embedConsentPluginConfig);
        console.log('Embed Consent: Config loaded from window.embedConsentPluginConfig');
    }
    // Method 2: Check for meta tag configuration
    else {
        var metaConfig = document.querySelector('meta[name="embed-consent-config"]');
        if (metaConfig) {
            try {
                var dataConfig = JSON.parse(metaConfig.content);
                Object.assign(config, dataConfig);
                console.log('Embed Consent: Config loaded from meta tag');
            } catch (e) {
                console.warn('Embed Consent: Failed to parse meta config:', e);
            }
        } else {
            console.log('Embed Consent: Using default configuration');
        }
    }

    // Set data attributes on html element for the main plugin to read
    var root = document.documentElement;
    if (root && root.dataset) {
        root.dataset.embedConsentStorage = String(config.enableLocalStorage);
        root.dataset.embedConsentAlwaysAllow = String(config.showAlwaysAllowOption);

        if (config.language) {
            root.dataset.embedConsentLanguage = config.language;
        }

        if (config.privacyPolicyUrl) {
            root.dataset.embedConsentPrivacyUrl = config.privacyPolicyUrl;
        }

        console.log('Embed Consent: Configuration applied:', config);
    } else {
        console.warn('Embed Consent: Could not set configuration - document.documentElement not available');
    }

    // Early iframe blocker (prevent loading before consent)
    var earlyBlockerObserver = null;

    function blockIframe(iframe) {
        // Skip if already wrapped by main plugin
        if (iframe.closest('.embed-consent-wrapper')) {
            return;
        }

        // Skip if marked as no-consent
        if (iframe.matches('.no-consent, [data-no-consent]')) {
            return;
        }

        var src = iframe.getAttribute('src');
        if (src) {
            // Move src to data-consent-src to prevent loading
            iframe.dataset.consentSrc = src;
            iframe.removeAttribute('src');
        }
    }

    // Block any existing iframes
    var existingIframes = document.querySelectorAll('iframe');
    for (var i = 0; i < existingIframes.length; i++) {
        blockIframe(existingIframes[i]);
    }

    // Set up MutationObserver to catch iframes as they're added to the DOM
    if (typeof MutationObserver !== 'undefined') {
        earlyBlockerObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType === 1) {
                        if (node.tagName === 'IFRAME') {
                            blockIframe(node);
                        } else if (node.querySelectorAll) {
                            var iframes = node.querySelectorAll('iframe');
                            for (var j = 0; j < iframes.length; j++) {
                                blockIframe(iframes[j]);
                            }
                        }
                    }
                }
            });
        });

        if (document.documentElement) {
            earlyBlockerObserver.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    // Cleanup function
    window.__embedConsentCleanupEarlyBlocker = function() {
        if (earlyBlockerObserver) {
            earlyBlockerObserver.disconnect();
            earlyBlockerObserver = null;
        }
    };
})();
