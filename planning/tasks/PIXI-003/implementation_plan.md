# PIXI-003: Configuration System - Implementation Plan

## Overview
Implement a YAML-based configuration system that loads layout definitions for screens, manages global settings, and provides an interface for positioning sprites and controlling application behavior.

## Technical Requirements
- Parse YAML configuration files using js-yaml
- Support global application settings (screen size, background, fps)
- Define multiple screens with sprite layouts
- Handle sprite positioning, z-ordering, and visibility
- Validate configuration data
- Hot-reload configuration during development

## Implementation Steps

### Step 1: Create Configuration Schema
Understanding the expected YAML structure from requirements:

```yaml
global:
  screen_width: 1920
  screen_height: 1080
  background_color: "#000000"
  fps_limit: 60
  pixel_perfect: true
  initial_screen: "main_menu"

screens:
  main_game:
    background_color: "#1a1a2e"
    music: "assets/audio/menu_theme.ogg"
    sprites:
      title_logo:
        texture: "background.png"
        position: { x: 960, y: 200 }
        z_order: 10
        visible: true
      start_button:
        texture: "base_line.png"
        position: { x: 960, y: 450 }
        z_order: 20
        visible: true
```

### Step 2: Create Configuration Loader
**File:** `src/loaders/ConfigLoader.js`
```javascript
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
        return parseInt(hex, 16);
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
```

### Step 3: Create Configuration Manager
**File:** `src/core/ConfigManager.js`
```javascript
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
}

// Export singleton instance
export const configManager = new ConfigManager();
```

### Step 4: Create Example Configuration File
**File:** `config/layouts.yml`
```yaml
global:
  screen_width: 1920
  screen_height: 1080
  background_color: "#000000"
  fps_limit: 60
  pixel_perfect: true
  initial_screen: "main_game"

# Screen definitions
screens:
  # Main Game Screen using available sprites
  main_game:
    background_color: "#1a1a2e"
    music: "assets/audio/menu_theme.ogg"
    sprites:
      # Background image (large)
      game_background:
        texture: "background.png"
        position:
          x: 960
          y: 540
        z_order: 1
        visible: true
        scale:
          x: 1.0
          y: 1.0
      
      # Game logo
      title_logo:
        texture: "td-logo.png"
        position:
          x: 960
          y: 200
        z_order: 10
        visible: true
      
      # Domino pieces
      domino_1:
        texture: "1.png"
        position:
          x: 400
          y: 400
        z_order: 20
        visible: true
        
      domino_2:
        texture: "2.png"
        position:
          x: 500
          y: 400
        z_order: 20
        visible: true
        
      domino_3:
        texture: "3.png"
        position:
          x: 600
          y: 400
        z_order: 20
        visible: true
      
      # Game base elements
      game_base:
        texture: "base.png"
        position:
          x: 960
          y: 800
        z_order: 15
        visible: true
        
      # Player frames
      player_frames:
        texture: "frames_players.png"
        position:
          x: 960
          y: 900
        z_order: 5
        visible: true

  # Test screen for development
  test_screen:
    background_color: "#333333"
    sprites:
      test_sprite:
        texture: "1.png"
        position:
          x: 960
          y: 540
        z_order: 10
        visible: true
        scale:
          x: 2.0
          y: 2.0
```

### Step 5: Create Configuration Utilities
**File:** `src/utils/ConfigUtils.js`
```javascript
import { configManager } from '../core/ConfigManager.js';

/**
 * Apply sprite configuration to PIXI sprite
 * @param {PIXI.Sprite} sprite - PIXI sprite object
 * @param {Object} config - Sprite configuration
 */
export function applySpriteConfig(sprite, config) {
    if (!sprite || !config) return;

    // Position
    if (config.position) {
        sprite.x = config.position.x || 0;
        sprite.y = config.position.y || 0;
    }

    // Scale
    if (config.scale) {
        sprite.scale.x = config.scale.x || 1;
        sprite.scale.y = config.scale.y || 1;
    }

    // Rotation (convert from degrees if needed)
    if (config.rotation !== undefined) {
        sprite.rotation = config.rotation;
    }

    // Visibility
    if (config.visible !== undefined) {
        sprite.visible = config.visible;
    }

    // Z-index for layering
    if (config.z_order !== undefined) {
        sprite.zIndex = config.z_order;
    }

    // Anchor point
    if (config.anchor) {
        sprite.anchor.x = config.anchor.x || 0.5;
        sprite.anchor.y = config.anchor.y || 0.5;
    } else {
        // Default anchor to center
        sprite.anchor.set(0.5);
    }

    // Alpha/transparency
    if (config.alpha !== undefined) {
        sprite.alpha = config.alpha;
    }
}

/**
 * Create sprites for current screen
 * @param {SpriteFactory} spriteFactory - Sprite factory instance
 * @returns {PIXI.Sprite[]} Array of created sprites
 */
export function createScreenSprites(spriteFactory) {
    const sprites = [];
    const spriteConfigs = configManager.getCurrentScreenSprites();

    for (const [spriteName, spriteConfig] of Object.entries(spriteConfigs)) {
        const sprite = spriteFactory.createSprite(spriteConfig.texture);
        
        if (sprite) {
            applySpriteConfig(sprite, spriteConfig);
            sprite.name = spriteName; // Assign name for debugging
            sprites.push(sprite);
        } else {
            console.warn(`Failed to create sprite: ${spriteName} with texture: ${spriteConfig.texture}`);
        }
    }

    // Sort by z-order
    sprites.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    return sprites;
}

/**
 * Validate configuration during development
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result
 */
export function validateConfigInDev(config) {
    const errors = [];
    const warnings = [];

    if (!config) {
        errors.push('Configuration is null or undefined');
        return { valid: false, errors, warnings };
    }

    // Check for common issues
    if (config.global) {
        const { screen_width, screen_height } = config.global;
        if (screen_width <= 0 || screen_height <= 0) {
            errors.push('Invalid screen dimensions');
        }
    }

    // Check screen references
    if (config.screens) {
        for (const [screenName, screenConfig] of Object.entries(config.screens)) {
            if (screenConfig.sprites) {
                for (const [spriteName, spriteConfig] of Object.entries(screenConfig.sprites)) {
                    if (!spriteConfig.texture) {
                        errors.push(`Missing texture for ${spriteName} in ${screenName}`);
                    }
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
```

### Step 6: Update Main Application to Use Configuration
**File:** `src/main.js` (Updated to use configuration)
```javascript
import * as PIXI from 'pixi.js';
import { spriteFactory } from './loaders/SpriteFactory.js';
import { configManager } from './core/ConfigManager.js';
import { createLoadingScreen } from './utils/LoadingUtils.js';
import { createScreenSprites } from './utils/ConfigUtils.js';

async function initializeApp() {
    try {
        // Load configuration first
        await configManager.initialize('/config/layouts.yml');
        
        // Create PIXI application with config settings
        const appConfig = configManager.getPixiAppConfig();
        const app = new PIXI.Application(appConfig);

        // Add canvas to DOM
        document.getElementById('game-container').appendChild(app.view);

        // Show loading screen
        const loadingScreen = createLoadingScreen(app);
        app.stage.addChild(loadingScreen);

        // Load sprite atlas
        await spriteFactory.initialize();
        
        // Remove loading screen
        app.stage.removeChild(loadingScreen);
        
        // Create and display current screen
        await displayCurrentScreen(app);
        
        // Setup screen switching (for development)
        setupScreenSwitching(app);
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

async function displayCurrentScreen(app) {
    // Clear existing sprites
    app.stage.removeChildren();
    
    // Set background color
    const bgColor = configManager.getScreenBackgroundColor(configManager.currentScreen);
    app.renderer.backgroundColor = bgColor;
    
    // Create and add sprites for current screen
    const sprites = createScreenSprites(spriteFactory);
    
    // Enable sorting by z-index
    app.stage.sortableChildren = true;
    
    // Add all sprites to stage
    sprites.forEach(sprite => {
        app.stage.addChild(sprite);
    });
    
    console.log(`Displayed screen: ${configManager.currentScreen} with ${sprites.length} sprites`);
}

function setupScreenSwitching(app) {
    const availableScreens = configManager.getAvailableScreens();
    
    // Add keyboard shortcuts for screen switching (for development)
    window.addEventListener('keydown', async (event) => {
        const key = event.key;
        
        if (key >= '1' && key <= '9') {
            const screenIndex = parseInt(key) - 1;
            const targetScreen = availableScreens[screenIndex];
            
            if (targetScreen && configManager.switchToScreen(targetScreen)) {
                await displayCurrentScreen(app);
            }
        }
    });
    
    console.log('Press 1-9 to switch between screens:', availableScreens);
}

// Initialize when DOM is ready
initializeApp();
```

### Step 7: Create Tests
**File:** `tests/loaders/ConfigLoader.test.js`
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigLoader } from '../../src/loaders/ConfigLoader.js';

describe('ConfigLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new ConfigLoader();
    });

    it('should create ConfigLoader instance', () => {
        expect(loader).toBeInstanceOf(ConfigLoader);
        expect(loader.isLoaded).toBe(false);
    });

    it('should convert hex colors to PIXI numbers', () => {
        expect(loader.hexToPixiColor('#000000')).toBe(0x000000);
        expect(loader.hexToPixiColor('#ffffff')).toBe(0xffffff);
        expect(loader.hexToPixiColor('#1a1a2e')).toBe(0x1a1a2e);
    });

    it('should handle invalid hex colors', () => {
        expect(loader.hexToPixiColor('')).toBe(0x000000);
        expect(loader.hexToPixiColor(null)).toBe(0x000000);
        expect(loader.hexToPixiColor(undefined)).toBe(0x000000);
    });
});
```

## Success Criteria
1. ✅ YAML configuration loads without errors
2. ✅ Global settings are correctly parsed and applied
3. ✅ Screen definitions create proper sprite layouts
4. ✅ Sprite positioning and z-ordering works correctly
5. ✅ Background colors are applied per screen
6. ✅ Configuration validation catches errors
7. ✅ Screen switching works in development
8. ✅ Example layout renders correctly with available sprites

## Dependencies
- **Requires:** PIXI-001 (Project Foundation)
- **Enables:** PIXI-004 (Core Rendering Engine)

## Estimated Time
- 90-120 minutes for implementation and testing

## Risk Factors
- YAML parsing errors with complex configurations
- Color format compatibility
- Configuration validation complexity
- Performance impact of frequent config reads

## Testing Strategy
- Unit tests for ConfigLoader methods
- Integration tests with actual YAML files
- Validation tests for configuration errors
- Visual tests to verify sprite positioning from config