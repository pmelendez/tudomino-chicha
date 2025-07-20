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
        expect(loader.hexToPixiColor('#FF0000')).toBe(0xff0000);
    });

    it('should handle invalid hex colors', () => {
        expect(loader.hexToPixiColor('')).toBe(0x000000);
        expect(loader.hexToPixiColor(null)).toBe(0x000000);
        expect(loader.hexToPixiColor(undefined)).toBe(0x000000);
        expect(loader.hexToPixiColor('invalid')).toBe(0x000000);
    });

    it('should handle hex colors without # prefix', () => {
        expect(loader.hexToPixiColor('ff0000')).toBe(0xff0000);
        expect(loader.hexToPixiColor('1a1a2e')).toBe(0x1a1a2e);
    });

    it('should return null for config methods when not loaded', () => {
        expect(loader.getGlobalConfig()).toBe(null);
        expect(loader.getScreenConfig('test')).toBe(null);
        expect(loader.getScreenNames()).toEqual([]);
        expect(loader.getSpriteConfig('test', 'sprite')).toBe(null);
        expect(loader.getScreenSprites('test')).toEqual({});
        expect(loader.getInitialScreen()).toBe(null);
    });

    it('should return default app dimensions when not loaded', () => {
        const dimensions = loader.getAppDimensions();
        expect(dimensions).toEqual({
            width: 1920,
            height: 1080
        });
    });

    it('should return default background color when not loaded', () => {
        const bgColor = loader.getScreenBackgroundColor('test');
        expect(bgColor).toBe(0x000000);
    });

    describe('validation', () => {
        it('should validate required global settings', () => {
            loader.config = {
                global: {
                    screen_width: 1920
                    // missing screen_height and initial_screen
                },
                screens: {}
            };

            expect(() => loader._validateConfig()).toThrow('Missing required global setting: screen_height');
        });

        it('should validate that initial screen exists', () => {
            loader.config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    initial_screen: 'nonexistent'
                },
                screens: {
                    'main_game': {}
                }
            };

            expect(() => loader._validateConfig()).toThrow('Initial screen "nonexistent" not found in screens');
        });

        it('should validate sprite configuration', () => {
            loader.config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    initial_screen: 'main_game'
                },
                screens: {
                    'main_game': {
                        sprites: {
                            'test_sprite': {
                                // missing texture
                                position: { x: 100, y: 100 }
                            }
                        }
                    }
                }
            };

            expect(() => loader._validateConfig()).toThrow('Missing texture for sprite "test_sprite" in screen "main_game"');
        });

        it('should validate sprite position format', () => {
            loader.config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    initial_screen: 'main_game'
                },
                screens: {
                    'main_game': {
                        sprites: {
                            'test_sprite': {
                                texture: 'test.png',
                                position: { x: 'invalid', y: 100 }
                            }
                        }
                    }
                }
            };

            expect(() => loader._validateConfig()).toThrow('Invalid position for sprite "test_sprite" in screen "main_game"');
        });

        it('should validate z_order format', () => {
            loader.config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    initial_screen: 'main_game'
                },
                screens: {
                    'main_game': {
                        sprites: {
                            'test_sprite': {
                                texture: 'test.png',
                                z_order: 'invalid'
                            }
                        }
                    }
                }
            };

            expect(() => loader._validateConfig()).toThrow('Invalid z_order for sprite "test_sprite" in screen "main_game"');
        });
    });

    describe('with mock config', () => {
        beforeEach(() => {
            // Setup mock config for testing
            loader.config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    background_color: '#1a1a2e',
                    fps_limit: 60,
                    pixel_perfect: true,
                    initial_screen: 'main_game'
                },
                screens: {
                    'main_game': {
                        background_color: '#333333',
                        sprites: {
                            'background': {
                                texture: 'background.png',
                                position: { x: 960, y: 540 },
                                z_order: 1,
                                visible: true
                            },
                            'logo': {
                                texture: 'logo.png',
                                position: { x: 960, y: 200 },
                                z_order: 10,
                                visible: true
                            }
                        }
                    },
                    'test_screen': {
                        sprites: {
                            'test_sprite': {
                                texture: 'test.png',
                                position: { x: 100, y: 100 },
                                visible: false
                            }
                        }
                    }
                }
            };
            loader.isLoaded = true;
        });

        it('should return global config', () => {
            const global = loader.getGlobalConfig();
            expect(global.screen_width).toBe(1920);
            expect(global.screen_height).toBe(1080);
            expect(global.initial_screen).toBe('main_game');
        });

        it('should return specific screen config', () => {
            const screen = loader.getScreenConfig('main_game');
            expect(screen.background_color).toBe('#333333');
            expect(screen.sprites).toBeDefined();
        });

        it('should return screen names', () => {
            const names = loader.getScreenNames();
            expect(names).toEqual(['main_game', 'test_screen']);
        });

        it('should return sprite config', () => {
            const sprite = loader.getSpriteConfig('main_game', 'background');
            expect(sprite.texture).toBe('background.png');
            expect(sprite.position).toEqual({ x: 960, y: 540 });
        });

        it('should return screen sprites', () => {
            const sprites = loader.getScreenSprites('main_game');
            expect(Object.keys(sprites)).toEqual(['background', 'logo']);
        });

        it('should return initial screen', () => {
            expect(loader.getInitialScreen()).toBe('main_game');
        });

        it('should return app dimensions from config', () => {
            const dimensions = loader.getAppDimensions();
            expect(dimensions).toEqual({
                width: 1920,
                height: 1080
            });
        });

        it('should return screen background color with fallback', () => {
            // Screen with specific background color
            const mainGameBg = loader.getScreenBackgroundColor('main_game');
            expect(mainGameBg).toBe(0x333333);

            // Screen without background color (should use global)
            const testScreenBg = loader.getScreenBackgroundColor('test_screen');
            expect(testScreenBg).toBe(0x1a1a2e);

            // Non-existent screen (should use global)
            const nonExistentBg = loader.getScreenBackgroundColor('nonexistent');
            expect(nonExistentBg).toBe(0x1a1a2e);
        });
    });
});