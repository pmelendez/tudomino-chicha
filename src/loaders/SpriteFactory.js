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

        // Apply position
        if (config.position) {
            animSprite.x = config.position.x || 0;
            animSprite.y = config.position.y || 0;
        }

        // Apply visibility
        if (config.visible !== undefined) {
            animSprite.visible = config.visible;
        }

        // Apply z-order (will be used by scene manager)
        if (config.z_order !== undefined) {
            animSprite.zIndex = config.z_order;
        }

        // Apply scale
        if (config.scale) {
            animSprite.scale.x = config.scale.x || 1;
            animSprite.scale.y = config.scale.y || 1;
        }

        // Apply rotation
        if (config.rotation !== undefined) {
            animSprite.rotation = config.rotation;
        }

        return animSprite;
    }

    // Direct delegation methods for backward compatibility
    createSprite(textureName) {
        return this.textureLoader.createSprite(textureName);
    }

    createAnimatedSprite(animationName) {
        return this.textureLoader.createAnimatedSprite(animationName);
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