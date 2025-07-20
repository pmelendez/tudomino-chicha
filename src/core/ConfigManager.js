import { configLoader } from '../loaders/ConfigLoader.js';

export class ConfigManager {
    constructor() {
        this.currentScreen = null;
        this.globalConfig = null;
    }

    async initialize(configPath) {
        await configLoader.load(configPath);
        this.globalConfig = configLoader.getGlobalConfig();
        this.currentScreen = configLoader.getInitialScreen();
        
        console.log(`ConfigManager initialized. Initial screen: ${this.currentScreen}`);
        return this.globalConfig;
    }

    /**
     * Switch to a different screen
     * @param {string} screenName - Name of the screen to switch to
     * @returns {boolean} Success status
     */
    switchToScreen(screenName) {
        if (!configLoader.getScreenConfig(screenName)) {
            console.error(`Screen not found: ${screenName}`);
            return false;
        }
        
        this.currentScreen = screenName;
        console.log(`Switched to screen: ${screenName}`);
        return true;
    }

    /**
     * Get current screen configuration
     * @returns {Object|null}
     */
    getCurrentScreenConfig() {
        return configLoader.getScreenConfig(this.currentScreen);
    }

    /**
     * Get current screen sprites
     * @returns {Object}
     */
    getCurrentScreenSprites() {
        return configLoader.getScreenSprites(this.currentScreen);
    }

    /**
     * Get application configuration for PIXI app
     * @returns {Object}
     */
    getPixiAppConfig() {
        const dimensions = configLoader.getAppDimensions();
        const backgroundColor = configLoader.hexToPixiColor(
            this.globalConfig?.background_color || "#000000"
        );

        return {
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: !this.globalConfig?.pixel_perfect,
            powerPreference: 'high-performance'
        };
    }

    /**
     * Get FPS limit setting
     * @returns {number}
     */
    getFpsLimit() {
        return this.globalConfig?.fps_limit || 60;
    }

    /**
     * Check if pixel perfect rendering is enabled
     * @returns {boolean}
     */
    isPixelPerfect() {
        return this.globalConfig?.pixel_perfect || false;
    }

    /**
     * Get available screen names
     * @returns {string[]}
     */
    getAvailableScreens() {
        return configLoader.getScreenNames();
    }

    /**
     * Get background color for screen
     * @param {string} screenName - Name of the screen
     * @returns {number}
     */
    getScreenBackgroundColor(screenName) {
        return configLoader.getScreenBackgroundColor(screenName);
    }
}

// Export singleton instance
export const configManager = new ConfigManager();