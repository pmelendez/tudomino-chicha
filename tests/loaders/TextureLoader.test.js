import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextureLoader } from '../../src/loaders/TextureLoader.js';
import * as PIXI from 'pixi.js';

// Mock PIXI
vi.mock('pixi.js', () => ({
    Texture: {
        from: vi.fn()
    },
    Sprite: vi.fn(),
    AnimatedSprite: vi.fn()
}));

describe('TextureLoader', () => {
    let loader;

    beforeEach(() => {
        vi.clearAllMocks();
        loader = new TextureLoader();
    });

    describe('constructor', () => {
        it('should create TextureLoader instance', () => {
            expect(loader).toBeInstanceOf(TextureLoader);
            expect(loader.isLoaded).toBe(false);
            expect(loader.textures).toBeInstanceOf(Map);
            expect(loader.animations).toBeInstanceOf(Map);
        });

        it('should have empty texture and animation maps initially', () => {
            expect(loader.textures.size).toBe(0);
            expect(loader.animations.size).toBe(0);
        });

        it('should have default atlas path', () => {
            expect(loader.atlasPath).toBe('/assets/sprites.json');
        });
    });

    describe('before loading', () => {
        it('should return null when getting texture before loading', () => {
            const texture = loader.getTexture('1.png');
            expect(texture).toBeNull();
        });

        it('should return null when getting animation before loading', () => {
            const animation = loader.getAnimation('CPU');
            expect(animation).toBeNull();
        });

        it('should return empty arrays for available sprites and animations initially', () => {
            expect(loader.getAvailableSprites()).toEqual([]);
            expect(loader.getAvailableAnimations()).toEqual([]);
        });

        it('should return null when creating sprite before loading', () => {
            const sprite = loader.createSprite('1.png');
            expect(sprite).toBeNull();
        });

        it('should return null when creating animated sprite before loading', () => {
            const animSprite = loader.createAnimatedSprite('CPU');
            expect(animSprite).toBeNull();
        });
    });

    describe('load', () => {
        it('should load atlas successfully', async () => {
            const mockAtlasData = {
                frames: {
                    '1.png': { frame: { x: 0, y: 0, w: 32, h: 32 } },
                    '2.png': { frame: { x: 32, y: 0, w: 32, h: 32 } }
                },
                animations: {
                    'CPU': ['1.png', '2.png']
                },
                meta: {
                    image: 'sprites.png'
                }
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockAtlasData)
            });

            const mockTexture = { width: 32, height: 32 };
            PIXI.Texture.from.mockReturnValue(mockTexture);

            await loader.load();

            expect(global.fetch).toHaveBeenCalledWith('/assets/sprites.json');
            expect(PIXI.Texture.from).toHaveBeenCalledWith('/assets/sprites.png');
            expect(loader.isLoaded).toBe(true);
            expect(loader.textures.size).toBe(2);
            expect(loader.animations.size).toBe(1);
        });

        it('should handle fetch error', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            });

            await expect(loader.load()).rejects.toThrow('Failed to load atlas: 404');
            expect(loader.isLoaded).toBe(false);
        });

        it('should handle network error', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(loader.load()).rejects.toThrow('Network error');
            expect(loader.isLoaded).toBe(false);
        });

        it('should not reload if already loaded', async () => {
            loader.isLoaded = true;
            
            await loader.load();

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should handle atlas without animations', async () => {
            const mockAtlasData = {
                frames: {
                    '1.png': { frame: { x: 0, y: 0, w: 32, h: 32 } }
                },
                meta: {
                    image: 'sprites.png'
                }
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockAtlasData)
            });

            const mockTexture = { width: 32, height: 32 };
            PIXI.Texture.from.mockReturnValue(mockTexture);

            await loader.load();

            expect(loader.isLoaded).toBe(true);
            expect(loader.textures.size).toBe(1);
            expect(loader.animations.size).toBe(0);
        });

        it('should handle custom atlas path', async () => {
            const customLoader = new TextureLoader('/custom/path.json');
            
            const mockAtlasData = {
                frames: {},
                meta: { image: 'custom.png' }
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockAtlasData)
            });

            PIXI.Texture.from.mockReturnValue({});

            await customLoader.load();

            expect(global.fetch).toHaveBeenCalledWith('/custom/path.json');
            expect(PIXI.Texture.from).toHaveBeenCalledWith('/custom/custom.png');
        });
    });

    describe('after loading', () => {
        beforeEach(async () => {
            const mockAtlasData = {
                frames: {
                    '1.png': { frame: { x: 0, y: 0, w: 32, h: 32 } },
                    '2.png': { frame: { x: 32, y: 0, w: 32, h: 32 } },
                    '3.png': { frame: { x: 0, y: 32, w: 32, h: 32 } }
                },
                animations: {
                    'walk': ['1.png', '2.png'],
                    'idle': ['3.png']
                },
                meta: {
                    image: 'sprites.png'
                }
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockAtlasData)
            });

            const mockTexture = { width: 32, height: 32 };
            PIXI.Texture.from.mockReturnValue(mockTexture);

            await loader.load();
        });

        describe('getTexture', () => {
            it('should return texture for valid frame', () => {
                const result = loader.getTexture('1.png');
                expect(result).not.toBeNull();
            });

            it('should return null for invalid frame', () => {
                const result = loader.getTexture('nonexistent.png');
                expect(result).toBeNull();
            });
        });

        describe('getAnimation', () => {
            it('should return animation textures for valid animation', () => {
                const result = loader.getAnimation('walk');
                expect(result).toHaveLength(2);
            });

            it('should return null for invalid animation', () => {
                const result = loader.getAnimation('nonexistent');
                expect(result).toBeNull();
            });
        });

        describe('getAvailableSprites', () => {
            it('should return all sprite names', () => {
                const result = loader.getAvailableSprites();
                expect(result).toEqual(['1.png', '2.png', '3.png']);
            });
        });

        describe('getAvailableAnimations', () => {
            it('should return all animation names', () => {
                const result = loader.getAvailableAnimations();
                expect(result).toEqual(['walk', 'idle']);
            });
        });

        describe('createSprite', () => {
            it('should create sprite for valid texture', () => {
                const mockSprite = { texture: 'mock-texture' };
                PIXI.Sprite.mockReturnValue(mockSprite);

                const result = loader.createSprite('1.png');

                expect(PIXI.Sprite).toHaveBeenCalled();
                expect(result).toBe(mockSprite);
            });

            it('should return null for invalid texture', () => {
                const result = loader.createSprite('nonexistent.png');
                expect(result).toBeNull();
            });
        });

        describe('createAnimatedSprite', () => {
            it('should create animated sprite for valid animation', () => {
                const mockAnimSprite = { textures: ['tex1', 'tex2'] };
                PIXI.AnimatedSprite.mockReturnValue(mockAnimSprite);

                const result = loader.createAnimatedSprite('walk');

                expect(PIXI.AnimatedSprite).toHaveBeenCalled();
                expect(result).toBe(mockAnimSprite);
            });

            it('should return null for invalid animation', () => {
                const result = loader.createAnimatedSprite('nonexistent');
                expect(result).toBeNull();
            });
        });
    });

    describe('error handling', () => {
        it('should handle malformed JSON', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            await expect(loader.load()).rejects.toThrow('Invalid JSON');
        });

        it('should handle missing meta image', async () => {
            const mockAtlasData = {
                frames: {
                    '1.png': { frame: { x: 0, y: 0, w: 32, h: 32 } }
                },
                meta: {} // missing image
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockAtlasData)
            });

            await expect(loader.load()).rejects.toThrow();
        });
    });
});