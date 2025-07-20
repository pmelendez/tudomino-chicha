# PIXI-002: Asset Loading System - Implementation Plan

## Overview
Implement a robust texture atlas loading system that can parse the existing sprites.json and sprites.png files, providing an easy interface for loading and accessing individual sprites.

## Technical Requirements
- Load and parse TexturePacker-generated JSON format
- Handle async loading with proper error handling
- Provide sprite access by name
- Support animations (CPU animation already defined in sprites.json)
- Cache loaded textures for performance

## Implementation Steps

### Step 1: Analyze Existing Sprite Atlas
Based on `assets/sprites.json`, we have:
- 25+ individual sprites (dominoes 1-6, UI elements, characters, effects)
- 1 animation sequence: "CPU" with 3 frames
- Texture size: 1898x1868 pixels
- Standard TexturePacker format

### Step 2: Create TextureLoader Class
**File:** `src/loaders/TextureLoader.js`
```javascript
import * as PIXI from 'pixi.js';

export class TextureLoader {
    constructor() {
        this.spritesheet = null;
        this.textures = new Map();
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load sprite atlas and JSON data
     * @param {string} jsonPath - Path to sprite atlas JSON
     * @param {string} imagePath - Path to sprite atlas image  
     * @returns {Promise<void>}
     */
    async load(jsonPath = '/assets/sprites.json', imagePath = '/assets/sprites.png') {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadAssets(jsonPath, imagePath);
        return this.loadPromise;
    }

    async _loadAssets(jsonPath, imagePath) {
        try {
            // Load JSON metadata
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load sprite data: ${response.statusText}`);
            }
            const spriteData = await response.json();

            // Load and create spritesheet
            const texture = await PIXI.Texture.fromURL(imagePath);
            this.spritesheet = new PIXI.Spritesheet(texture, spriteData);
            
            // Parse the spritesheet
            await this.spritesheet.parse();

            // Cache textures for quick access
            this._cacheTextures();
            this.isLoaded = true;

            console.log(`Loaded ${this.textures.size} sprites from atlas`);
        } catch (error) {
            console.error('Failed to load sprite atlas:', error);
            throw error;
        }
    }

    _cacheTextures() {
        if (!this.spritesheet) return;

        // Cache individual textures
        for (const [name, texture] of Object.entries(this.spritesheet.textures)) {
            this.textures.set(name, texture);
        }

        // Cache animations
        if (this.spritesheet.animations) {
            for (const [name, frames] of Object.entries(this.spritesheet.animations)) {
                this.textures.set(`anim_${name}`, frames);
            }
        }
    }

    /**
     * Get texture by name
     * @param {string} name - Sprite name (e.g., "1.png", "background.png")
     * @returns {PIXI.Texture|null}
     */
    getTexture(name) {
        if (!this.isLoaded) {
            console.warn('TextureLoader: Attempting to get texture before loading complete');
            return null;
        }
        return this.textures.get(name) || null;
    }

    /**
     * Get animation frames by name
     * @param {string} name - Animation name (e.g., "CPU")
     * @returns {PIXI.Texture[]|null}
     */
    getAnimation(name) {
        return this.textures.get(`anim_${name}`) || null;
    }

    /**
     * Create sprite from texture name
     * @param {string} textureName - Name of texture
     * @returns {PIXI.Sprite|null}
     */
    createSprite(textureName) {
        const texture = this.getTexture(textureName);
        if (!texture) {
            console.warn(`Texture not found: ${textureName}`);
            return null;
        }
        return new PIXI.Sprite(texture);
    }

    /**
     * Create animated sprite from animation name
     * @param {string} animationName - Name of animation
     * @returns {PIXI.AnimatedSprite|null}
     */
    createAnimatedSprite(animationName) {
        const frames = this.getAnimation(animationName);
        if (!frames) {
            console.warn(`Animation not found: ${animationName}`);
            return null;
        }
        return new PIXI.AnimatedSprite(frames);
    }

    /**
     * Get list of available sprite names
     * @returns {string[]}
     */
    getAvailableSprites() {
        return Array.from(this.textures.keys()).filter(name => !name.startsWith('anim_'));
    }

    /**
     * Get list of available animations
     * @returns {string[]}
     */
    getAvailableAnimations() {
        return Array.from(this.textures.keys())
            .filter(name => name.startsWith('anim_'))
            .map(name => name.replace('anim_', ''));
    }
}
```

### Step 3: Create Sprite Factory
**File:** `src/loaders/SpriteFactory.js`
```javascript
import { TextureLoader } from './TextureLoader.js';

export class SpriteFactory {
    constructor() {
        this.textureLoader = new TextureLoader();
        this.loadPromise = null;
    }

    async initialize() {
        if (!this.loadPromise) {
            this.loadPromise = this.textureLoader.load();
        }
        return this.loadPromise;
    }

    /**
     * Create sprite with configuration
     * @param {string} textureName - Texture name
     * @param {Object} config - Sprite configuration
     * @param {Object} config.position - {x, y} position
     * @param {number} config.z_order - Z-order for layering
     * @param {boolean} config.visible - Visibility
     * @param {Object} config.scale - {x, y} scale factors
     * @param {number} config.rotation - Rotation in radians
     * @returns {PIXI.Sprite|null}
     */
    createConfiguredSprite(textureName, config = {}) {
        const sprite = this.textureLoader.createSprite(textureName);
        if (!sprite) return null;

        // Apply position
        if (config.position) {
            sprite.x = config.position.x || 0;
            sprite.y = config.position.y || 0;
        }

        // Apply visibility
        if (config.visible !== undefined) {
            sprite.visible = config.visible;
        }

        // Apply z-order (will be used by scene manager)
        if (config.z_order !== undefined) {
            sprite.zIndex = config.z_order;
        }

        // Apply scale
        if (config.scale) {
            sprite.scale.x = config.scale.x || 1;
            sprite.scale.y = config.scale.y || 1;
        }

        // Apply rotation
        if (config.rotation !== undefined) {
            sprite.rotation = config.rotation;
        }

        return sprite;
    }

    /**
     * Create animated sprite with configuration
     * @param {string} animationName - Animation name
     * @param {Object} config - Animation configuration
     * @returns {PIXI.AnimatedSprite|null}
     */
    createConfiguredAnimation(animationName, config = {}) {
        const animSprite = this.textureLoader.createAnimatedSprite(animationName);
        if (!animSprite) return null;

        // Configure animation
        animSprite.animationSpeed = config.speed || 0.1;
        animSprite.loop = config.loop !== false; // Default to true

        // Apply common sprite config
        return this.createConfiguredSprite(null, config) || animSprite;
    }

    // Getters to access TextureLoader methods
    getAvailableSprites() {
        return this.textureLoader.getAvailableSprites();
    }

    getAvailableAnimations() {
        return this.textureLoader.getAvailableAnimations();
    }
}

// Export singleton instance
export const spriteFactory = new SpriteFactory();
```

### Step 4: Create Loading Utilities
**File:** `src/utils/LoadingUtils.js`
```javascript
/**
 * Utility functions for asset loading
 */

/**
 * Create loading screen
 * @param {PIXI.Application} app - PIXI application
 * @returns {PIXI.Container} Loading screen container
 */
export function createLoadingScreen(app) {
    const container = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.drawRect(0, 0, app.screen.width, app.screen.height);
    bg.endFill();
    container.addChild(bg);
    
    // Loading text
    const text = new PIXI.Text('Loading...', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffffff,
        align: 'center'
    });
    text.anchor.set(0.5);
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    container.addChild(text);
    
    return container;
}

/**
 * Preload assets with progress tracking
 * @param {string[]} assetPaths - Array of asset paths
 * @param {Function} onProgress - Progress callback (progress: 0-1)
 * @returns {Promise<void>}
 */
export async function preloadAssets(assetPaths, onProgress = null) {
    let loaded = 0;
    const total = assetPaths.length;
    
    const promises = assetPaths.map(async (path) => {
        try {
            await PIXI.Texture.fromURL(path);
            loaded++;
            if (onProgress) {
                onProgress(loaded / total);
            }
        } catch (error) {
            console.warn(`Failed to preload: ${path}`, error);
            loaded++;
            if (onProgress) {
                onProgress(loaded / total);
            }
        }
    });
    
    await Promise.all(promises);
}
```

### Step 5: Update Main Application
**File:** `src/main.js` (Updated)
```javascript
import * as PIXI from 'pixi.js';
import { spriteFactory } from './loaders/SpriteFactory.js';
import { createLoadingScreen } from './utils/LoadingUtils.js';

async function initializeApp() {
    // Create PIXI application
    const app = new PIXI.Application({
        width: 1920,
        height: 1080,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
    });

    // Add canvas to DOM
    document.getElementById('game-container').appendChild(app.view);

    // Show loading screen
    const loadingScreen = createLoadingScreen(app);
    app.stage.addChild(loadingScreen);

    try {
        // Load sprite atlas
        await spriteFactory.initialize();
        
        // Remove loading screen
        app.stage.removeChild(loadingScreen);
        
        // Create test sprites
        await createTestScene(app);
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

async function createTestScene(app) {
    // Test sprite creation
    const background = spriteFactory.createConfiguredSprite('background.png', {
        position: { x: 960, y: 540 },
        visible: true
    });
    
    if (background) {
        background.anchor.set(0.5);
        app.stage.addChild(background);
    }

    // Test domino pieces
    const domino1 = spriteFactory.createConfiguredSprite('1.png', {
        position: { x: 300, y: 300 },
        visible: true
    });
    
    if (domino1) {
        app.stage.addChild(domino1);
    }

    // Test animation
    const cpuAnim = spriteFactory.createConfiguredAnimation('CPU', {
        position: { x: 600, y: 300 },
        speed: 0.1,
        loop: true
    });
    
    if (cpuAnim) {
        cpuAnim.play();
        app.stage.addChild(cpuAnim);
    }

    console.log('Available sprites:', spriteFactory.getAvailableSprites());
    console.log('Available animations:', spriteFactory.getAvailableAnimations());
}

// Initialize when DOM is ready
initializeApp();
```

### Step 6: Create Tests
**File:** `tests/loaders/TextureLoader.test.js`
```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import { TextureLoader } from '../../src/loaders/TextureLoader.js';

describe('TextureLoader', () => {
    let loader;

    beforeAll(() => {
        loader = new TextureLoader();
    });

    it('should create TextureLoader instance', () => {
        expect(loader).toBeInstanceOf(TextureLoader);
        expect(loader.isLoaded).toBe(false);
    });

    it('should have empty texture map initially', () => {
        expect(loader.textures.size).toBe(0);
    });

    // Note: Actual loading tests would require mocked assets
    // in a real test environment
});
```

## Success Criteria
1. ✅ TextureLoader successfully loads sprites.json and sprites.png
2. ✅ Individual sprites can be accessed by name
3. ✅ CPU animation frames are correctly loaded
4. ✅ SpriteFactory creates configured sprites correctly
5. ✅ Error handling works for missing assets
6. ✅ Loading screen displays during asset loading
7. ✅ Test sprites render correctly in browser

## Dependencies
- **Requires:** PIXI-001 (Project Foundation)
- **Enables:** PIXI-004 (Core Rendering Engine)

## Estimated Time
- 60-90 minutes for implementation and testing

## Risk Factors
- CORS issues when loading assets in development
- TexturePacker format compatibility
- Memory usage with large sprite atlases
- Async loading timing issues

## Testing Strategy
- Unit tests for TextureLoader class methods
- Integration tests with actual sprite assets
- Visual tests to verify sprites render correctly
- Performance tests for loading large atlases