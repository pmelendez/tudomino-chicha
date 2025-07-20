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