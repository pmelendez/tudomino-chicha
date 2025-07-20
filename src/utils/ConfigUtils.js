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