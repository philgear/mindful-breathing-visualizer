/**
 * Mindful Breathing i18n Utility
 * Fetches and applies translations from /locales/{lang}.json
 */

const I18n = {
    locale: "en",
    translations: {},

    // Fallback English strings to prevent UI blanking if fetch fails
    defaults: {
        "ui": {
            "title": "Mindful Breathing",
            "start": "Start Practice",
            "stop": "Stop Session"
        },
        "phases": {
            "inhale": { "label": "Inhale" },
            "hold": { "label": "Hold" },
            "exhale": { "label": "Exhale" }
        },
        "ui": {
            "title": "Mindful Breathing",
            "start": "Start Practice",
            "stop": "Stop Session",
            "left": "Left",
            "right": "Right"
        }
    },

    async init() {
        // Detect language from URL or Browser
        const urlParams = new URLSearchParams(window.location.search);
        this.locale = urlParams.get('lang') || navigator.language.split('-')[0] || 'en';

        console.log(`[i18n] Initializing language: ${this.locale}`);

        try {
            // Attempt to fetch specific locale
            const response = await fetch(`locales/${this.locale}.json`);
            if (response.ok) {
                this.translations = await response.json();
                console.log(`[i18n] Loaded ${this.locale}`);
            } else {
                console.warn(`[i18n] Failed to load ${this.locale}, falling back to English.`);
                this.translations = this.defaults;
            }
        } catch (e) {
            console.warn(`[i18n] Network error or CORS block. Using default English locale.`);
            this.translations = this.defaults;
        }

        this.apply();
        return this.translations;
    },

    /**
     * Get a translation by key (e.g., "phases.inhale.label")
     */
    t(key) {
        const keys = key.split('.');
        let current = this.translations;

        for (const k of keys) {
            if (current[k] === undefined) {
                // Try fallback
                let fallback = this.defaults;
                for (const fk of keys) {
                    if (fallback[fk]) fallback = fallback[fk];
                }
                return typeof fallback === 'string' ? fallback : key;
            }
            current = current[k];
        }
        return current;
    },

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);
            if (text) {
                if (el.tagName === 'INPUT' && el.type === 'placeholder') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        // Update document title
        const title = this.t('ui.title');
        if (title) document.title = title;
    }
};

// Auto-init if simpler usage is preferred, or call explicitly in main app
// window.addEventListener('DOMContentLoaded', () => I18n.init());
