import * as YAML from 'js-yaml';

export class ConfigLoader {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load configuration from YAML file
     * @param {string} configPath - Path to YAML config file
     * @returns {Promise<Object>}
     */
    async load(configPath = '/config/layouts.yml') {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadConfig(configPath);
        return this.loadPromise;
    }

    async _loadConfig(configPath) {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.statusText}`);
            }

            const yamlText = await response.text();
            this.config = YAML.load(yamlText);
            
            // Validate configuration
            this._validateConfig();
            
            this.isLoaded = true;
            console.log('Configuration loaded successfully');
            return this.config;
            
        } catch (error) {
            console.error('Failed to load configuration:', error);
            throw error;
        }
    }

    _validateConfig() {
        if (!this.config) {
            throw new Error('Configuration is empty');
        }

        // Validate global settings
        if (!this.config.global) {
            throw new Error('Missing global configuration section');
        }

        const global = this.config.global;
        const requiredGlobalKeys = ['screen_width', 'screen_height', 'initial_screen'];
        
        for (const key of requiredGlobalKeys) {
            if (global[key] === undefined) {
                throw new Error(`Missing required global setting: ${key}`);
            }
        }

        // Validate screens
        if (!this.config.screens || Object.keys(this.config.screens).length === 0) {
            throw new Error('No screens defined in configuration');
        }

        // Validate initial screen exists
        if (!this.config.screens[global.initial_screen]) {
            throw new Error(`Initial screen "${global.initial_screen}" not found in screens`);
        }

        // Validate each screen
        for (const [screenName, screenConfig] of Object.entries(this.config.screens)) {
            this._validateScreen(screenName, screenConfig);
        }
    }

    _validateScreen(screenName, screenConfig) {
        if (!screenConfig || typeof screenConfig !== 'object') {
            throw new Error(`Invalid screen configuration for: ${screenName}`);
        }

        // Validate sprites if they exist
        if (screenConfig.sprites) {
            for (const [spriteName, spriteConfig] of Object.entries(screenConfig.sprites)) {
                this._validateSprite(screenName, spriteName, spriteConfig);
            }
        }
    }

    _validateSprite(screenName, spriteName, spriteConfig) {
        if (!spriteConfig.texture) {
            throw new Error(`Missing texture for sprite "${spriteName}" in screen "${screenName}"`);
        }

        // Validate position if provided
        if (spriteConfig.position) {
            if (typeof spriteConfig.position.x !== 'number' || typeof spriteConfig.position.y !== 'number') {
                throw new Error(`Invalid position for sprite "${spriteName}" in screen "${screenName}"`);
            }
        }

        // Validate z_order if provided
        if (spriteConfig.z_order !== undefined && typeof spriteConfig.z_order !== 'number') {
            throw new Error(`Invalid z_order for sprite "${spriteName}" in screen "${screenName}"`);
        }
    }

    /**
     * Get global configuration
     * @returns {Object|null}
     */
    getGlobalConfig() {
        return this.config?.global || null;
    }

    /**
     * Get specific screen configuration
     * @param {string} screenName - Name of the screen
     * @returns {Object|null}
     */
    getScreenConfig(screenName) {
        return this.config?.screens?.[screenName] || null;
    }

    /**
     * Get all screen names
     * @returns {string[]}
     */
    getScreenNames() {
        return this.config?.screens ? Object.keys(this.config.screens) : [];
    }

    /**
     * Get sprite configuration for a screen
     * @param {string} screenName - Name of the screen
     * @param {string} spriteName - Name of the sprite
     * @returns {Object|null}
     */
    getSpriteConfig(screenName, spriteName) {
        const screen = this.getScreenConfig(screenName);
        return screen?.sprites?.[spriteName] || null;
    }

    /**
     * Get all sprite configurations for a screen
     * @param {string} screenName - Name of the screen
     * @returns {Object}
     */
    getScreenSprites(screenName) {
        const screen = this.getScreenConfig(screenName);
        return screen?.sprites || {};
    }

    /**
     * Get initial screen name
     * @returns {string|null}
     */
    getInitialScreen() {
        return this.config?.global?.initial_screen || null;
    }

    /**
     * Convert hex color to PIXI color number
     * @param {string} hexColor - Hex color string (e.g., "#1a1a2e")
     * @returns {number}
     */
    hexToPixiColor(hexColor) {
        if (!hexColor || typeof hexColor !== 'string') {
            return 0x000000;
        }
        
        // Remove # if present
        const hex = hexColor.replace('#', '');
        
        // Check if the hex string is valid (only contains hex characters)
        if (!/^[0-9A-Fa-f]+$/.test(hex)) {
            return 0x000000;
        }
        
        const result = parseInt(hex, 16);
        return isNaN(result) ? 0x000000 : result;
    }

    /**
     * Get application dimensions
     * @returns {{width: number, height: number}}
     */
    getAppDimensions() {
        const global = this.getGlobalConfig();
        return {
            width: global?.screen_width || 1920,
            height: global?.screen_height || 1080
        };
    }

    /**
     * Get background color for screen
     * @param {string} screenName - Name of the screen
     * @returns {number}
     */
    getScreenBackgroundColor(screenName) {
        const screen = this.getScreenConfig(screenName);
        const screenBg = screen?.background_color;
        const globalBg = this.getGlobalConfig()?.background_color;
        
        return this.hexToPixiColor(screenBg || globalBg || "#000000");
    }
}

// Export singleton instance
export const configLoader = new ConfigLoader();