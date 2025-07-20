import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configManager } from '../../src/core/ConfigManager.js';
import { spriteFactory } from '../../src/loaders/SpriteFactory.js';
import { createScreenSprites } from '../../src/utils/ConfigUtils.js';
import { createLoadingScreen, preloadAssets } from '../../src/utils/LoadingUtils.js';

// Mock PIXI Application
const mockPIXIApp = () => ({
    stage: {
        addChild: vi.fn(),
        removeChild: vi.fn(),
        removeChildren: vi.fn(),
        sortableChildren: false
    },
    screen: {
        width: 1920,
        height: 1080
    },
    renderer: {
        backgroundColor: 0x000000
    },
    view: document.createElement('canvas')
});

describe('Application Workflow Integration', () => {
    let mockApp;

    beforeEach(() => {
        vi.clearAllMocks();
        mockApp = mockPIXIApp();

        // Reset all modules
        configManager.currentScreen = null;
        configManager.globalConfig = null;
        
        // Mock DOM element
        document.getElementById = vi.fn().mockReturnValue({
            appendChild: vi.fn()
        });
    });

    describe('Application Initialization Flow', () => {
        it('should complete full initialization sequence', async () => {
            // Mock configuration data
            const mockConfigData = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080,
                    background_color: '#1a1a2e',
                    fps_limit: 60,
                    pixel_perfect: false,
                    initial_screen: 'main_game'
                },
                screens: {
                    main_game: {
                        background_color: '#333333',
                        sprites: {
                            background: {
                                texture: 'bg.png',
                                position: { x: 960, y: 540 },
                                z_order: 1
                            },
                            player: {
                                texture: 'player.png',
                                position: { x: 100, y: 100 },
                                z_order: 10
                            }
                        }
                    }
                }
            };

            // Mock fetch for config loading
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    text: () => Promise.resolve('global:\n  screen_width: 1920\n  screen_height: 1080\n  background_color: "#1a1a2e"\n  fps_limit: 60\n  pixel_perfect: false\n  initial_screen: "main_game"\nscreens:\n  main_game:\n    background_color: "#333333"\n    sprites:\n      background:\n        texture: "bg.png"\n        position: { x: 960, y: 540 }\n        z_order: 1\n      player:\n        texture: "player.png"\n        position: { x: 100, y: 100 }\n        z_order: 10')
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        frames: {
                            'bg.png': { frame: { x: 0, y: 0, w: 100, h: 100 } },
                            'player.png': { frame: { x: 100, y: 0, w: 32, h: 32 } }
                        },
                        animations: {},
                        meta: { image: 'sprites.png' }
                    })
                });

            // Mock sprite creation
            const mockSprites = {
                background: {
                    x: 0, y: 0, zIndex: 0, name: '',
                    scale: { x: 1, y: 1 },
                    anchor: { set: vi.fn() }
                },
                player: {
                    x: 0, y: 0, zIndex: 0, name: '',
                    scale: { x: 1, y: 1 },
                    anchor: { set: vi.fn() }
                }
            };

            spriteFactory.textureLoader.createSprite = vi.fn()
                .mockReturnValueOnce(mockSprites.background)
                .mockReturnValueOnce(mockSprites.player);

            // Step 1: Initialize configuration
            await configManager.initialize('/config/layouts.yml');
            
            expect(configManager.currentScreen).toBe('main_game');
            expect(configManager.globalConfig).toBeDefined();

            // Step 2: Create PIXI app config
            const appConfig = configManager.getPixiAppConfig();
            
            expect(appConfig.width).toBe(1920);
            expect(appConfig.height).toBe(1080);
            expect(appConfig.backgroundColor).toBe(0x1a1a2e);

            // Step 3: Initialize sprite factory
            await spriteFactory.initialize();

            // Step 4: Create loading screen
            const loadingScreen = createLoadingScreen(mockApp);
            mockApp.stage.addChild(loadingScreen);

            expect(mockApp.stage.addChild).toHaveBeenCalledWith(loadingScreen);

            // Step 5: Remove loading screen and create sprites
            mockApp.stage.removeChild(loadingScreen);
            
            const sprites = createScreenSprites(spriteFactory);
            
            expect(sprites).toHaveLength(2);
            expect(sprites[0].name).toBe('background');
            expect(sprites[1].name).toBe('player');
            expect(sprites[0].zIndex).toBe(1);
            expect(sprites[1].zIndex).toBe(10);

            // Step 6: Add sprites to stage
            mockApp.stage.sortableChildren = true;
            sprites.forEach(sprite => {
                mockApp.stage.addChild(sprite);
            });

            expect(mockApp.stage.addChild).toHaveBeenCalledTimes(3); // loading + 2 sprites
            expect(mockApp.stage.sortableChildren).toBe(true);
        });

        it('should handle initialization failures gracefully', async () => {
            // Mock failed config load
            global.fetch = vi.fn().mockRejectedValue(new Error('Config load failed'));

            await expect(configManager.initialize('/config/layouts.yml')).rejects.toThrow('Config load failed');
            
            expect(configManager.currentScreen).toBe(null);
            expect(configManager.globalConfig).toBe(null);
        });

        it('should handle sprite creation failures', async () => {
            // Mock successful config load
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    text: () => Promise.resolve('global:\n  initial_screen: "main_game"\nscreens:\n  main_game:\n    sprites:\n      test_sprite:\n        texture: "test.png"')
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        frames: {},
                        animations: {},
                        meta: { image: 'sprites.png' }
                    })
                });

            await configManager.initialize('/config/layouts.yml');
            await spriteFactory.initialize();

            // Mock failed sprite creation
            spriteFactory.textureLoader.createSprite = vi.fn().mockReturnValue(null);

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const sprites = createScreenSprites(spriteFactory);

            expect(sprites).toHaveLength(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to create sprite: test_sprite with texture: test.png'
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Screen Switching Flow', () => {
        beforeEach(async () => {
            // Setup mock config with multiple screens
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    text: () => Promise.resolve(`
global:
  initial_screen: "menu"
screens:
  menu:
    background_color: "#000000"
    sprites:
      logo:
        texture: "logo.png"
        position: { x: 960, y: 200 }
        z_order: 1
  game:
    background_color: "#1a1a2e"
    sprites:
      background:
        texture: "bg.png"
        position: { x: 960, y: 540 }
        z_order: 1
      player:
        texture: "player.png"
        position: { x: 100, y: 100 }
        z_order: 10
`)
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        frames: {
                            'logo.png': { frame: { x: 0, y: 0, w: 200, h: 100 } },
                            'bg.png': { frame: { x: 0, y: 100, w: 100, h: 100 } },
                            'player.png': { frame: { x: 100, y: 100, w: 32, h: 32 } }
                        },
                        animations: {},
                        meta: { image: 'sprites.png' }
                    })
                });

            await configManager.initialize('/config/layouts.yml');
            await spriteFactory.initialize();
        });

        it('should switch screens and update display', () => {
            expect(configManager.currentScreen).toBe('menu');

            // Switch to game screen
            const success = configManager.switchToScreen('game');
            expect(success).toBe(true);
            expect(configManager.currentScreen).toBe('game');

            // Clear existing sprites
            mockApp.stage.removeChildren();
            expect(mockApp.stage.removeChildren).toHaveBeenCalled();

            // Update background color
            const bgColor = configManager.getScreenBackgroundColor('game');
            mockApp.renderer.backgroundColor = bgColor;
            expect(mockApp.renderer.backgroundColor).toBe(0x1a1a2e);

            // Create new sprites
            const mockGameSprites = [
                { name: 'background', zIndex: 1, scale: { x: 1, y: 1 }, anchor: { set: vi.fn() } },
                { name: 'player', zIndex: 10, scale: { x: 1, y: 1 }, anchor: { set: vi.fn() } }
            ];

            spriteFactory.textureLoader.createSprite = vi.fn()
                .mockReturnValueOnce(mockGameSprites[0])
                .mockReturnValueOnce(mockGameSprites[1]);

            const sprites = createScreenSprites(spriteFactory);
            
            expect(sprites).toHaveLength(2);
            expect(sprites[0].name).toBe('background');
            expect(sprites[1].name).toBe('player');

            // Add sprites to stage
            sprites.forEach(sprite => {
                mockApp.stage.addChild(sprite);
            });

            expect(mockApp.stage.addChild).toHaveBeenCalledTimes(2);
        });

        it('should get available screens for navigation', () => {
            const availableScreens = configManager.getAvailableScreens();
            expect(availableScreens).toEqual(['menu', 'game']);
        });

        it('should prevent switching to invalid screen', () => {
            const initialScreen = configManager.currentScreen;
            
            const success = configManager.switchToScreen('nonexistent');
            
            expect(success).toBe(false);
            expect(configManager.currentScreen).toBe(initialScreen);
        });
    });

    describe('Asset Loading Flow', () => {
        it('should preload assets with progress tracking', async () => {
            const assetPaths = [
                '/assets/image1.png',
                '/assets/image2.png',
                '/assets/image3.png'
            ];

            const progressUpdates = [];
            const onProgress = (progress) => {
                progressUpdates.push(progress);
            };

            // Mock successful texture loading
            const mockTexture = { width: 100, height: 100 };
            global.PIXI = {
                Texture: {
                    fromURL: vi.fn().mockResolvedValue(mockTexture)
                }
            };

            await preloadAssets(assetPaths, onProgress);

            expect(progressUpdates).toEqual([1/3, 2/3, 1]);
            expect(global.PIXI.Texture.fromURL).toHaveBeenCalledTimes(3);
        });

        it('should handle partial asset loading failures', async () => {
            const assetPaths = [
                '/assets/good1.png',
                '/assets/bad.png',
                '/assets/good2.png'
            ];

            const progressUpdates = [];
            const onProgress = (progress) => {
                progressUpdates.push(progress);
            };

            global.PIXI = {
                Texture: {
                    fromURL: vi.fn()
                        .mockResolvedValueOnce({})
                        .mockRejectedValueOnce(new Error('Load failed'))
                        .mockResolvedValueOnce({})
                }
            };

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            await preloadAssets(assetPaths, onProgress);

            expect(progressUpdates).toEqual([1/3, 2/3, 1]);
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to preload: /assets/bad.png',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle missing game container element', () => {
            document.getElementById = vi.fn().mockReturnValue(null);

            expect(() => {
                const container = document.getElementById('game-container');
                if (!container) {
                    throw new Error('Game container not found');
                }
            }).toThrow('Game container not found');
        });

        it('should handle configuration without screens', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('global:\n  initial_screen: "main"')
            });

            await expect(configManager.initialize('/config/layouts.yml')).rejects.toThrow();
        });

        it('should handle empty sprite configuration', () => {
            configManager.currentScreen = 'empty_screen';
            
            // Mock empty sprites
            const getCurrentScreenSpritesSpy = vi.spyOn(configManager, 'getCurrentScreenSprites')
                .mockReturnValue({});

            const sprites = createScreenSprites(spriteFactory);

            expect(sprites).toEqual([]);
            expect(getCurrentScreenSpritesSpy).toHaveBeenCalled();

            getCurrentScreenSpritesSpy.mockRestore();
        });
    });
});