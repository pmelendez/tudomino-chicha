import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpriteFactory, spriteFactory } from '../../src/loaders/SpriteFactory.js';
import { TextureLoader } from '../../src/loaders/TextureLoader.js';

// Mock TextureLoader
vi.mock('../../src/loaders/TextureLoader.js', () => ({
    TextureLoader: vi.fn(() => ({
        load: vi.fn(),
        createSprite: vi.fn(),
        createAnimatedSprite: vi.fn(),
        getAvailableSprites: vi.fn(),
        getAvailableAnimations: vi.fn()
    }))
}));

describe('SpriteFactory', () => {
    let factory;
    let mockTextureLoader;

    beforeEach(() => {
        vi.clearAllMocks();
        factory = new SpriteFactory();
        mockTextureLoader = factory.textureLoader;
    });

    describe('constructor', () => {
        it('should create SpriteFactory instance', () => {
            expect(factory).toBeInstanceOf(SpriteFactory);
            expect(factory.textureLoader).toBeDefined();
            expect(factory.loadPromise).toBe(null);
        });
    });

    describe('initialize', () => {
        it('should initialize texture loader once', async () => {
            const mockPromise = Promise.resolve();
            mockTextureLoader.load.mockReturnValue(mockPromise);

            const result1 = await factory.initialize();
            const result2 = await factory.initialize();

            expect(mockTextureLoader.load).toHaveBeenCalledTimes(1);
            expect(factory.loadPromise).toBe(mockPromise);
        });

        it('should handle load failure', async () => {
            const error = new Error('Load failed');
            mockTextureLoader.load.mockRejectedValue(error);

            await expect(factory.initialize()).rejects.toThrow('Load failed');
        });
    });

    describe('createConfiguredSprite', () => {
        let mockSprite;

        beforeEach(() => {
            mockSprite = {
                x: 0,
                y: 0,
                visible: true,
                zIndex: 0,
                scale: { x: 1, y: 1 },
                rotation: 0
            };
            mockTextureLoader.createSprite.mockReturnValue(mockSprite);
        });

        it('should create sprite with default config', () => {
            const result = factory.createConfiguredSprite('test.png');

            expect(mockTextureLoader.createSprite).toHaveBeenCalledWith('test.png');
            expect(result).toBe(mockSprite);
        });

        it('should apply position configuration', () => {
            const config = {
                position: { x: 100, y: 200 }
            };

            const result = factory.createConfiguredSprite('test.png', config);

            expect(result.x).toBe(100);
            expect(result.y).toBe(200);
        });

        it('should apply partial position configuration', () => {
            const config = {
                position: { x: 150 } // missing y
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.x).toBe(150);
            expect(mockSprite.y).toBe(0);
        });

        it('should apply visibility configuration', () => {
            const config = {
                visible: false
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.visible).toBe(false);
        });

        it('should apply z_order configuration', () => {
            const config = {
                z_order: 10
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.zIndex).toBe(10);
        });

        it('should apply scale configuration', () => {
            const config = {
                scale: { x: 2, y: 1.5 }
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.scale.x).toBe(2);
            expect(mockSprite.scale.y).toBe(1.5);
        });

        it('should apply partial scale configuration', () => {
            const config = {
                scale: { y: 3 } // missing x
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.scale.x).toBe(1);
            expect(mockSprite.scale.y).toBe(3);
        });

        it('should apply rotation configuration', () => {
            const config = {
                rotation: Math.PI / 2
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.rotation).toBe(Math.PI / 2);
        });

        it('should apply all configurations together', () => {
            const config = {
                position: { x: 100, y: 200 },
                visible: false,
                z_order: 5,
                scale: { x: 2, y: 2 },
                rotation: Math.PI
            };

            factory.createConfiguredSprite('test.png', config);

            expect(mockSprite.x).toBe(100);
            expect(mockSprite.y).toBe(200);
            expect(mockSprite.visible).toBe(false);
            expect(mockSprite.zIndex).toBe(5);
            expect(mockSprite.scale.x).toBe(2);
            expect(mockSprite.scale.y).toBe(2);
            expect(mockSprite.rotation).toBe(Math.PI);
        });

        it('should return null when texture loader fails', () => {
            mockTextureLoader.createSprite.mockReturnValue(null);

            const result = factory.createConfiguredSprite('invalid.png');

            expect(result).toBe(null);
        });

        it('should handle empty config object', () => {
            const result = factory.createConfiguredSprite('test.png', {});

            expect(result).toBe(mockSprite);
            // Should not modify sprite properties
            expect(mockSprite.x).toBe(0);
            expect(mockSprite.y).toBe(0);
        });
    });

    describe('createConfiguredAnimation', () => {
        let mockAnimSprite;

        beforeEach(() => {
            mockAnimSprite = {
                x: 0,
                y: 0,
                visible: true,
                zIndex: 0,
                scale: { x: 1, y: 1 },
                rotation: 0,
                animationSpeed: 0.1,
                loop: true
            };
            mockTextureLoader.createAnimatedSprite.mockReturnValue(mockAnimSprite);
        });

        it('should create animated sprite with default config', () => {
            const result = factory.createConfiguredAnimation('walk');

            expect(mockTextureLoader.createAnimatedSprite).toHaveBeenCalledWith('walk');
            expect(result).toBe(mockAnimSprite);
            expect(result.animationSpeed).toBe(0.1);
            expect(result.loop).toBe(true);
        });

        it('should apply animation speed configuration', () => {
            const config = {
                speed: 0.5
            };

            factory.createConfiguredAnimation('walk', config);

            expect(mockAnimSprite.animationSpeed).toBe(0.5);
        });

        it('should apply loop configuration', () => {
            const config = {
                loop: false
            };

            factory.createConfiguredAnimation('walk', config);

            expect(mockAnimSprite.loop).toBe(false);
        });

        it('should default loop to true when not specified', () => {
            const config = {};

            factory.createConfiguredAnimation('walk', config);

            expect(mockAnimSprite.loop).toBe(true);
        });

        it('should apply position configuration', () => {
            const config = {
                position: { x: 50, y: 75 }
            };

            factory.createConfiguredAnimation('walk', config);

            expect(mockAnimSprite.x).toBe(50);
            expect(mockAnimSprite.y).toBe(75);
        });

        it('should apply all configurations together', () => {
            const config = {
                speed: 0.3,
                loop: false,
                position: { x: 100, y: 200 },
                visible: false,
                z_order: 15,
                scale: { x: 1.5, y: 1.5 },
                rotation: Math.PI / 4
            };

            factory.createConfiguredAnimation('walk', config);

            expect(mockAnimSprite.animationSpeed).toBe(0.3);
            expect(mockAnimSprite.loop).toBe(false);
            expect(mockAnimSprite.x).toBe(100);
            expect(mockAnimSprite.y).toBe(200);
            expect(mockAnimSprite.visible).toBe(false);
            expect(mockAnimSprite.zIndex).toBe(15);
            expect(mockAnimSprite.scale.x).toBe(1.5);
            expect(mockAnimSprite.scale.y).toBe(1.5);
            expect(mockAnimSprite.rotation).toBe(Math.PI / 4);
        });

        it('should return null when texture loader fails', () => {
            mockTextureLoader.createAnimatedSprite.mockReturnValue(null);

            const result = factory.createConfiguredAnimation('invalid');

            expect(result).toBe(null);
        });
    });

    describe('getAvailableSprites', () => {
        it('should delegate to texture loader', () => {
            const mockSprites = ['sprite1.png', 'sprite2.png'];
            mockTextureLoader.getAvailableSprites.mockReturnValue(mockSprites);

            const result = factory.getAvailableSprites();

            expect(mockTextureLoader.getAvailableSprites).toHaveBeenCalled();
            expect(result).toBe(mockSprites);
        });
    });

    describe('getAvailableAnimations', () => {
        it('should delegate to texture loader', () => {
            const mockAnimations = ['walk', 'run', 'idle'];
            mockTextureLoader.getAvailableAnimations.mockReturnValue(mockAnimations);

            const result = factory.getAvailableAnimations();

            expect(mockTextureLoader.getAvailableAnimations).toHaveBeenCalled();
            expect(result).toBe(mockAnimations);
        });
    });

    describe('createSprite', () => {
        it('should delegate to texture loader', () => {
            const mockSprite = { name: 'test-sprite' };
            mockTextureLoader.createSprite.mockReturnValue(mockSprite);

            const result = factory.createSprite('test.png');

            expect(mockTextureLoader.createSprite).toHaveBeenCalledWith('test.png');
            expect(result).toBe(mockSprite);
        });
    });

    describe('createAnimatedSprite', () => {
        it('should delegate to texture loader', () => {
            const mockAnimSprite = { name: 'test-anim' };
            mockTextureLoader.createAnimatedSprite.mockReturnValue(mockAnimSprite);

            const result = factory.createAnimatedSprite('walk');

            expect(mockTextureLoader.createAnimatedSprite).toHaveBeenCalledWith('walk');
            expect(result).toBe(mockAnimSprite);
        });
    });

    describe('singleton instance', () => {
        it('should export singleton instance', () => {
            expect(spriteFactory).toBeInstanceOf(SpriteFactory);
        });
    });
});