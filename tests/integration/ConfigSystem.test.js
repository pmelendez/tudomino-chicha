import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configManager } from '../../src/core/ConfigManager.js';
import { configLoader } from '../../src/loaders/ConfigLoader.js';
import { applySpriteConfig, validateConfigInDev } from '../../src/utils/ConfigUtils.js';

// Mock PIXI Sprite for testing
class MockSprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scale = { x: 1, y: 1 };
        this.rotation = 0;
        this.visible = true;
        this.zIndex = 0;
        this.anchor = { x: 0.5, y: 0.5, set: vi.fn() };
        this.alpha = 1;
        this.name = '';
    }
}

describe('Configuration System Integration', () => {
    const mockConfig = {
        global: {
            screen_width: 1920,
            screen_height: 1080,
            background_color: "#000000",
            fps_limit: 60,
            pixel_perfect: true,
            initial_screen: "main_game"
        },
        screens: {
            main_game: {
                background_color: "#1a1a2e",
                sprites: {
                    background: {
                        texture: "background.png",
                        position: { x: 960, y: 540 },
                        z_order: 1,
                        visible: true,
                        scale: { x: 1.8, y: 1.3 }
                    },
                    logo: {
                        texture: "td-logo.png",
                        position: { x: 960, y: 200 },
                        z_order: 10,
                        visible: true
                    },
                    domino: {
                        texture: "1.png",
                        position: { x: 400, y: 400 },
                        z_order: 20,
                        visible: true,
                        alpha: 0.8
                    }
                }
            },
            test_screen: {
                background_color: "#333333",
                sprites: {
                    test_sprite: {
                        texture: "test.png",
                        position: { x: 100, y: 100 },
                        z_order: 5,
                        visible: false,
                        rotation: 1.57, // 90 degrees in radians
                        scale: { x: 2.0, y: 2.0 }
                    }
                }
            }
        }
    };

    beforeEach(() => {
        // Reset loaders
        configLoader.config = null;
        configLoader.isLoaded = false;
        configLoader.loadPromise = null;
        configManager.currentScreen = null;
        configManager.globalConfig = null;
    });

    describe('ConfigManager Integration', () => {
        it('should initialize with mock config', async () => {
            // Mock the configLoader.load method to avoid fetch call
            configLoader.load = vi.fn().mockResolvedValue(mockConfig);
            configLoader.config = mockConfig;
            configLoader.isLoaded = true;
            
            const result = await configManager.initialize();
            
            expect(result).toEqual(mockConfig.global);
            expect(configManager.currentScreen).toBe('main_game');
            expect(configManager.globalConfig).toEqual(mockConfig.global);
        });

        it('should switch screens successfully', () => {
            configLoader.config = mockConfig;
            configLoader.isLoaded = true;
            configManager.currentScreen = 'main_game';

            const success = configManager.switchToScreen('test_screen');
            
            expect(success).toBe(true);
            expect(configManager.currentScreen).toBe('test_screen');
        });

        it('should fail to switch to non-existent screen', () => {
            configLoader.config = mockConfig;
            configLoader.isLoaded = true;
            configManager.currentScreen = 'main_game';

            const success = configManager.switchToScreen('nonexistent');
            
            expect(success).toBe(false);
            expect(configManager.currentScreen).toBe('main_game');
        });

        it('should return correct PIXI app config', () => {
            configLoader.config = mockConfig;
            configLoader.isLoaded = true;
            configManager.globalConfig = mockConfig.global;

            const appConfig = configManager.getPixiAppConfig();
            
            expect(appConfig.width).toBe(1920);
            expect(appConfig.height).toBe(1080);
            expect(appConfig.backgroundColor).toBe(0x000000);
            expect(appConfig.antialias).toBe(false); // because pixel_perfect is true
        });

        it('should return current screen sprites', () => {
            configLoader.config = mockConfig;
            configLoader.isLoaded = true;
            configManager.currentScreen = 'main_game';

            const sprites = configManager.getCurrentScreenSprites();
            
            expect(Object.keys(sprites)).toEqual(['background', 'logo', 'domino']);
            expect(sprites.background.texture).toBe('background.png');
        });
    });

    describe('applySpriteConfig utility', () => {
        it('should apply all sprite configuration properties', () => {
            const sprite = new MockSprite();
            const config = {
                position: { x: 100, y: 200 },
                scale: { x: 1.5, y: 2.0 },
                rotation: 1.57,
                visible: false,
                z_order: 15,
                alpha: 0.7,
                anchor: { x: 0.2, y: 0.8 }
            };

            applySpriteConfig(sprite, config);

            expect(sprite.x).toBe(100);
            expect(sprite.y).toBe(200);
            expect(sprite.scale.x).toBe(1.5);
            expect(sprite.scale.y).toBe(2.0);
            expect(sprite.rotation).toBe(1.57);
            expect(sprite.visible).toBe(false);
            expect(sprite.zIndex).toBe(15);
            expect(sprite.alpha).toBe(0.7);
            expect(sprite.anchor.x).toBe(0.2);
            expect(sprite.anchor.y).toBe(0.8);
        });

        it('should handle partial configuration', () => {
            const sprite = new MockSprite();
            const config = {
                position: { x: 50, y: 75 },
                visible: false
            };

            applySpriteConfig(sprite, config);

            expect(sprite.x).toBe(50);
            expect(sprite.y).toBe(75);
            expect(sprite.visible).toBe(false);
            // Other properties should remain at defaults
            expect(sprite.scale.x).toBe(1);
            expect(sprite.scale.y).toBe(1);
            expect(sprite.rotation).toBe(0);
        });

        it('should handle empty or null config gracefully', () => {
            const sprite = new MockSprite();
            
            applySpriteConfig(sprite, null);
            applySpriteConfig(sprite, undefined);
            applySpriteConfig(sprite, {});

            // Should not throw and sprite should remain unchanged
            expect(sprite.x).toBe(0);
            expect(sprite.y).toBe(0);
        });

        it('should set default anchor to center when not specified', () => {
            const sprite = new MockSprite();
            const config = { position: { x: 100, y: 100 } };

            applySpriteConfig(sprite, config);

            expect(sprite.anchor.set).toHaveBeenCalledWith(0.5);
        });
    });

    describe('validateConfigInDev utility', () => {
        it('should validate correct configuration', () => {
            const result = validateConfigInDev(mockConfig);
            
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should detect invalid screen dimensions', () => {
            const invalidConfig = {
                ...mockConfig,
                global: {
                    ...mockConfig.global,
                    screen_width: -100,
                    screen_height: 0
                }
            };

            const result = validateConfigInDev(invalidConfig);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid screen dimensions');
        });

        it('should detect missing sprite textures', () => {
            const invalidConfig = {
                ...mockConfig,
                screens: {
                    test_screen: {
                        sprites: {
                            invalid_sprite: {
                                position: { x: 100, y: 100 }
                                // missing texture
                            }
                        }
                    }
                }
            };

            const result = validateConfigInDev(invalidConfig);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing texture for invalid_sprite in test_screen');
        });

        it('should handle null configuration', () => {
            const result = validateConfigInDev(null);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Configuration is null or undefined');
        });
    });
});