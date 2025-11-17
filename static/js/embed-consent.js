/**
 * Embed Consent Plugin for Hugo / Micro.blog
 *
 * Handles consent-protected embeds with localStorage support
 * and internationalization.
 *
 * @version 1.0.0
 */

(function() {
    'use strict';

    // LocalStorage key for the global preference
    const STORAGE_KEY = 'embedConsentAlwaysAllow';

    /**
     * Check if localStorage is available and enabled
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
     * Get the stored consent preference
     */
    function getStoredConsent() {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    /**
     * Save the consent preference
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
     * Load an embed by moving data-src to src
     */
    function loadEmbed(wrapper) {
        const iframe = wrapper.querySelector('.embed-consent-iframe');
        const overlay = wrapper.querySelector('.embed-consent-overlay');

        if (!iframe) {
            console.warn('No iframe found in embed wrapper');
            return;
        }

        const dataSrc = iframe.getAttribute('data-src');
        if (!dataSrc) {
            console.warn('No data-src attribute found on iframe');
            return;
        }

        // Move data-src to src to load the iframe
        iframe.setAttribute('src', dataSrc);

        // Mark wrapper as active
        wrapper.classList.add('embed-consent-active');

        // Hide the overlay
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Initialize a single embed wrapper
     */
    function initializeEmbed(wrapper) {
        const enableLocalStorage = wrapper.getAttribute('data-enable-localstorage') === 'true';
        const showAlwaysAllow = wrapper.getAttribute('data-show-always-allow') === 'true';
        const button = wrapper.querySelector('.embed-consent-button');
        const checkbox = wrapper.querySelector('.embed-consent-checkbox-input');

        if (!button) {
            console.warn('No consent button found in embed wrapper');
            return;
        }

        // Check if we should auto-load based on stored preference
        if (enableLocalStorage && getStoredConsent()) {
            loadEmbed(wrapper);
            return;
        }

        // Handle button click
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Check if we should save the preference
            if (enableLocalStorage && showAlwaysAllow && checkbox && checkbox.checked) {
                saveConsent(true);
            }

            // Load the embed
            loadEmbed(wrapper);
        });

        // Optional: Handle Enter key on button
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    }

    /**
     * Initialize all embeds on the page
     */
    function initializeAllEmbeds() {
        const wrappers = document.querySelectorAll('.embed-consent-wrapper');

        if (wrappers.length === 0) {
            return;
        }

        wrappers.forEach(function(wrapper) {
            try {
                initializeEmbed(wrapper);
            } catch (error) {
                console.error('Failed to initialize embed:', error);
            }
        });
    }

    /**
     * Global function to reset consent preference
     * Can be called from browser console: resetEmbedConsent()
     */
    window.resetEmbedConsent = function() {
        if (!isLocalStorageAvailable()) {
            alert('LocalStorage is not available in your browser.');
            return false;
        }

        const hadConsent = getStoredConsent();
        saveConsent(false);

        if (hadConsent) {
            const message = document.documentElement.lang === 'de'
                ? 'Die Einwilligung für externe Medien wurde zurückgesetzt. Bitte laden Sie die Seite neu.'
                : 'Embed consent preference has been reset. Please reload the page.';
            alert(message);
        } else {
            const message = document.documentElement.lang === 'de'
                ? 'Es war keine Einwilligung gespeichert.'
                : 'No consent preference was stored.';
            alert(message);
        }

        return true;
    };

    /**
     * Global function to check current consent status
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllEmbeds);
    } else {
        // DOM is already ready
        initializeAllEmbeds();
    }

    // Re-initialize if new content is added dynamically (e.g., via AJAX)
    // This is useful for single-page applications
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            let shouldReinit = false;

            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('embed-consent-wrapper')) {
                            shouldReinit = true;
                        } else if (node.querySelector && node.querySelector('.embed-consent-wrapper')) {
                            shouldReinit = true;
                        }
                    }
                });
            });

            if (shouldReinit) {
                // Small delay to ensure DOM is stable
                setTimeout(initializeAllEmbeds, 100);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
