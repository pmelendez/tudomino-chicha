import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applySpriteConfig, createScreenSprites, validateConfigInDev } from '../../src/utils/ConfigUtils.js';
import { configManager } from '../../src/core/ConfigManager.js';

// Mock the configManager
vi.mock('../../src/core/ConfigManager.js', () => ({
    configManager: {
        getCurrentScreenSprites: vi.fn()
    }
}));

describe('ConfigUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('applySpriteConfig', () => {
        let mockSprite;

        beforeEach(() => {
            mockSprite = {
                x: 0,
                y: 0,
                scale: { x: 1, y: 1 },
                rotation: 0,
                visible: true,
                zIndex: 0,
                anchor: { x: 0, y: 0, set: vi.fn() },
                alpha: 1
            };
        });

        it('should apply position configuration', () => {
            const config = {
                position: { x: 100, y: 200 }
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.x).toBe(100);
            expect(mockSprite.y).toBe(200);
        });

        it('should apply partial position configuration', () => {
            const config = {
                position: { x: 150 } // missing y
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.x).toBe(150);
            expect(mockSprite.y).toBe(0); // default
        });

        it('should apply scale configuration', () => {
            const config = {
                scale: { x: 2, y: 1.5 }
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.scale.x).toBe(2);
            expect(mockSprite.scale.y).toBe(1.5);
        });

        it('should apply partial scale configuration', () => {
            const config = {
                scale: { y: 3 } // missing x
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.scale.x).toBe(1); // default
            expect(mockSprite.scale.y).toBe(3);
        });

        it('should apply rotation configuration', () => {
            const config = {
                rotation: Math.PI / 4
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.rotation).toBe(Math.PI / 4);
        });

        it('should apply visibility configuration', () => {
            const config = {
                visible: false
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.visible).toBe(false);
        });

        it('should apply z_order configuration', () => {
            const config = {
                z_order: 10
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.zIndex).toBe(10);
        });

        it('should apply custom anchor configuration', () => {
            const config = {
                anchor: { x: 0.3, y: 0.7 }
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.anchor.x).toBe(0.3);
            expect(mockSprite.anchor.y).toBe(0.7);
        });

        it('should apply partial anchor configuration', () => {
            const config = {
                anchor: { y: 0.8 } // missing x
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.anchor.x).toBe(0.5); // default
            expect(mockSprite.anchor.y).toBe(0.8);
        });

        it('should set default anchor when no anchor config provided', () => {
            const config = {};

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.anchor.set).toHaveBeenCalledWith(0.5);
        });

        it('should apply alpha configuration', () => {
            const config = {
                alpha: 0.5
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.alpha).toBe(0.5);
        });

        it('should apply all configurations together', () => {
            const config = {
                position: { x: 100, y: 200 },
                scale: { x: 2, y: 2 },
                rotation: Math.PI,
                visible: false,
                z_order: 5,
                anchor: { x: 0.2, y: 0.8 },
                alpha: 0.7
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.x).toBe(100);
            expect(mockSprite.y).toBe(200);
            expect(mockSprite.scale.x).toBe(2);
            expect(mockSprite.scale.y).toBe(2);
            expect(mockSprite.rotation).toBe(Math.PI);
            expect(mockSprite.visible).toBe(false);
            expect(mockSprite.zIndex).toBe(5);
            expect(mockSprite.anchor.x).toBe(0.2);
            expect(mockSprite.anchor.y).toBe(0.8);
            expect(mockSprite.alpha).toBe(0.7);
        });

        it('should handle null sprite gracefully', () => {
            const config = { position: { x: 100, y: 200 } };

            expect(() => applySpriteConfig(null, config)).not.toThrow();
        });

        it('should handle null config gracefully', () => {
            expect(() => applySpriteConfig(mockSprite, null)).not.toThrow();
        });

        it('should handle undefined values gracefully', () => {
            const config = {
                position: { x: undefined, y: undefined },
                scale: { x: undefined, y: undefined },
                anchor: { x: undefined, y: undefined }
            };

            applySpriteConfig(mockSprite, config);

            expect(mockSprite.x).toBe(0); // default
            expect(mockSprite.y).toBe(0); // default
            expect(mockSprite.scale.x).toBe(1); // default
            expect(mockSprite.scale.y).toBe(1); // default
            expect(mockSprite.anchor.x).toBe(0.5); // default
            expect(mockSprite.anchor.y).toBe(0.5); // default
        });
    });

    describe('createScreenSprites', () => {
        let mockSpriteFactory;

        beforeEach(() => {
            mockSpriteFactory = {
                createSprite: vi.fn()
            };
        });

        it('should create sprites from screen configuration', () => {
            const spriteConfigs = {
                background: {
                    texture: 'bg.png',
                    position: { x: 0, y: 0 },
                    z_order: 1
                },
                player: {
                    texture: 'player.png',
                    position: { x: 100, y: 100 },
                    z_order: 10
                }
            };

            configManager.getCurrentScreenSprites.mockReturnValue(spriteConfigs);

            const mockBgSprite = {
                name: '',
                zIndex: 0,
                x: 0, y: 0,
                scale: { x: 1, y: 1 },
                anchor: { set: vi.fn() }
            };
            const mockPlayerSprite = {
                name: '',
                zIndex: 0,
                x: 0, y: 0,
                scale: { x: 1, y: 1 },
                anchor: { set: vi.fn() }
            };

            mockSpriteFactory.createSprite
                .mockReturnValueOnce(mockBgSprite)
                .mockReturnValueOnce(mockPlayerSprite);

            const result = createScreenSprites(mockSpriteFactory);

            expect(configManager.getCurrentScreenSprites).toHaveBeenCalled();
            expect(mockSpriteFactory.createSprite).toHaveBeenCalledWith('bg.png');
            expect(mockSpriteFactory.createSprite).toHaveBeenCalledWith('player.png');

            expect(mockBgSprite.name).toBe('background');
            expect(mockPlayerSprite.name).toBe('player');
            expect(mockBgSprite.zIndex).toBe(1);
            expect(mockPlayerSprite.zIndex).toBe(10);

            // Should be sorted by z-order (background first, then player)
            expect(result).toEqual([mockBgSprite, mockPlayerSprite]);
        });

        it('should sort sprites by z-order', () => {
            const spriteConfigs = {
                foreground: {
                    texture: 'fg.png',
                    z_order: 20
                },
                background: {
                    texture: 'bg.png',
                    z_order: 1
                },
                ui: {
                    texture: 'ui.png',
                    z_order: 15
                }
            };

            configManager.getCurrentScreenSprites.mockReturnValue(spriteConfigs);

            const mockFgSprite = { zIndex: 0, anchor: { set: vi.fn() } };
            const mockBgSprite = { zIndex: 0, anchor: { set: vi.fn() } };
            const mockUiSprite = { zIndex: 0, anchor: { set: vi.fn() } };

            mockSpriteFactory.createSprite
                .mockReturnValueOnce(mockFgSprite)
                .mockReturnValueOnce(mockBgSprite)
                .mockReturnValueOnce(mockUiSprite);

            const result = createScreenSprites(mockSpriteFactory);

            // Should be sorted: background (1), ui (15), foreground (20)
            expect(result[0].zIndex).toBe(1);
            expect(result[1].zIndex).toBe(15);
            expect(result[2].zIndex).toBe(20);
        });

        it('should handle sprites without z_order', () => {
            const spriteConfigs = {
                sprite1: { texture: 'sprite1.png' },
                sprite2: { texture: 'sprite2.png', z_order: 5 }
            };

            configManager.getCurrentScreenSprites.mockReturnValue(spriteConfigs);

            const mockSprite1 = { zIndex: undefined, anchor: { set: vi.fn() } };
            const mockSprite2 = { zIndex: 0, anchor: { set: vi.fn() } };

            mockSpriteFactory.createSprite
                .mockReturnValueOnce(mockSprite1)
                .mockReturnValueOnce(mockSprite2);

            const result = createScreenSprites(mockSpriteFactory);

            // sprite1 should come first (0 from undefined || 0), then sprite2 (5)
            expect(result[0]).toBe(mockSprite1);
            expect(result[1]).toBe(mockSprite2);
        });

        it('should handle failed sprite creation', () => {
            const spriteConfigs = {
                good_sprite: { texture: 'good.png' },
                bad_sprite: { texture: 'bad.png' }
            };

            configManager.getCurrentScreenSprites.mockReturnValue(spriteConfigs);

            const mockGoodSprite = { zIndex: 0, anchor: { set: vi.fn() } };

            mockSpriteFactory.createSprite
                .mockReturnValueOnce(mockGoodSprite)
                .mockReturnValueOnce(null); // Failed creation

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const result = createScreenSprites(mockSpriteFactory);

            expect(result).toEqual([mockGoodSprite]);
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to create sprite: bad_sprite with texture: bad.png'
            );

            consoleSpy.mockRestore();
        });

        it('should handle empty sprite configurations', () => {
            configManager.getCurrentScreenSprites.mockReturnValue({});

            const result = createScreenSprites(mockSpriteFactory);

            expect(result).toEqual([]);
            expect(mockSpriteFactory.createSprite).not.toHaveBeenCalled();
        });
    });

    describe('validateConfigInDev', () => {
        it('should validate valid configuration', () => {
            const config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080
                },
                screens: {
                    main: {
                        sprites: {
                            background: {
                                texture: 'bg.png'
                            }
                        }
                    }
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.warnings).toEqual([]);
        });

        it('should handle null configuration', () => {
            const result = validateConfigInDev(null);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Configuration is null or undefined');
        });

        it('should handle undefined configuration', () => {
            const result = validateConfigInDev(undefined);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Configuration is null or undefined');
        });

        it('should detect invalid screen dimensions', () => {
            const config = {
                global: {
                    screen_width: 0,
                    screen_height: -100
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid screen dimensions');
        });

        it('should detect missing sprite textures', () => {
            const config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080
                },
                screens: {
                    main: {
                        sprites: {
                            background: {
                                // Missing texture
                                position: { x: 0, y: 0 }
                            },
                            player: {
                                texture: 'player.png'
                            }
                        }
                    },
                    menu: {
                        sprites: {
                            logo: {
                                // Missing texture
                                visible: true
                            }
                        }
                    }
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing texture for background in main');
            expect(result.errors).toContain('Missing texture for logo in menu');
        });

        it('should handle configuration without global section', () => {
            const config = {
                screens: {
                    main: {
                        sprites: {
                            background: {
                                texture: 'bg.png'
                            }
                        }
                    }
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should handle configuration without screens section', () => {
            const config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should handle screens without sprites', () => {
            const config = {
                global: {
                    screen_width: 1920,
                    screen_height: 1080
                },
                screens: {
                    main: {
                        background_color: '#000000'
                    },
                    menu: {}
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should handle multiple validation errors', () => {
            const config = {
                global: {
                    screen_width: -1,
                    screen_height: 0
                },
                screens: {
                    main: {
                        sprites: {
                            sprite1: {},
                            sprite2: { position: { x: 0, y: 0 } }
                        }
                    }
                }
            };

            const result = validateConfigInDev(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid screen dimensions');
            expect(result.errors).toContain('Missing texture for sprite1 in main');
            expect(result.errors).toContain('Missing texture for sprite2 in main');
        });
    });
});