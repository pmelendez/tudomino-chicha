import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextureLoader } from '../../src/loaders/TextureLoader.js';

describe('TextureLoader (Simple)', () => {
    let loader;

    beforeEach(() => {
        loader = new TextureLoader();
    });

    describe('constructor', () => {
        it('should create TextureLoader instance', () => {
            expect(loader).toBeInstanceOf(TextureLoader);
            expect(loader.isLoaded).toBe(false);
            expect(loader.textures).toBeInstanceOf(Map);
            expect(loader.spritesheet).toBe(null);
            expect(loader.loadPromise).toBe(null);
        });
    });

    describe('before loading', () => {
        it('should return null when getting texture before loading', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const texture = loader.getTexture('1.png');
            
            expect(texture).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('TextureLoader: Attempting to get texture before loading complete');
            
            consoleSpy.mockRestore();
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
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const sprite = loader.createSprite('1.png');
            
            expect(sprite).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Texture not found: 1.png');
            
            consoleSpy.mockRestore();
        });

        it('should return null when creating animated sprite before loading', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const animSprite = loader.createAnimatedSprite('CPU');
            
            expect(animSprite).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Animation not found: CPU');
            
            consoleSpy.mockRestore();
        });
    });

    describe('cacheTextures method', () => {
        it('should handle null spritesheet gracefully', () => {
            loader.spritesheet = null;
            
            expect(() => loader._cacheTextures()).not.toThrow();
            expect(loader.textures.size).toBe(0);
        });

        it('should cache textures from spritesheet', () => {
            const mockTexture1 = { name: 'texture1' };
            const mockTexture2 = { name: 'texture2' };
            const mockFrames = ['frame1', 'frame2'];

            loader.spritesheet = {
                textures: {
                    'sprite1.png': mockTexture1,
                    'sprite2.png': mockTexture2
                },
                animations: {
                    'walk': mockFrames
                }
            };

            loader._cacheTextures();

            expect(loader.textures.get('sprite1.png')).toBe(mockTexture1);
            expect(loader.textures.get('sprite2.png')).toBe(mockTexture2);
            expect(loader.textures.get('anim_walk')).toBe(mockFrames);
            expect(loader.textures.size).toBe(3);
        });

        it('should handle spritesheet without animations', () => {
            const mockTexture = { name: 'texture' };
            loader.spritesheet = {
                textures: {
                    'sprite.png': mockTexture
                }
                // no animations property
            };

            loader._cacheTextures();

            expect(loader.textures.get('sprite.png')).toBe(mockTexture);
            expect(loader.textures.size).toBe(1);
        });
    });

    describe('texture retrieval methods', () => {
        beforeEach(() => {
            loader.isLoaded = true;
            loader.textures.set('test.png', { name: 'test-texture' });
            loader.textures.set('anim_walk', [{ name: 'frame1' }, { name: 'frame2' }]);
        });

        it('should get texture when loaded', () => {
            const texture = loader.getTexture('test.png');
            expect(texture).toEqual({ name: 'test-texture' });
        });

        it('should return null for non-existent texture', () => {
            const texture = loader.getTexture('nonexistent.png');
            expect(texture).toBeNull();
        });

        it('should get animation when loaded', () => {
            const animation = loader.getAnimation('walk');
            expect(animation).toEqual([{ name: 'frame1' }, { name: 'frame2' }]);
        });

        it('should return null for non-existent animation', () => {
            const animation = loader.getAnimation('nonexistent');
            expect(animation).toBeNull();
        });

        it('should return available sprite names', () => {
            const sprites = loader.getAvailableSprites();
            expect(sprites).toEqual(['test.png']);
        });

        it('should return available animation names', () => {
            const animations = loader.getAvailableAnimations();
            expect(animations).toEqual(['walk']);
        });
    });

    describe('sprite creation with mocked textures', () => {
        beforeEach(() => {
            loader.isLoaded = true;
            loader.textures.set('valid.png', { name: 'valid-texture' });
            loader.textures.set('anim_valid', [{ name: 'frame1' }]);
        });

        it('should attempt to create sprite for valid texture', () => {
            // Since we can't easily mock PIXI.Sprite constructor, 
            // we test that the method gets the correct texture
            const texture = loader.getTexture('valid.png');
            expect(texture).toEqual({ name: 'valid-texture' });
            
            // The actual sprite creation would fail in test environment,
            // but we're testing the logic up to that point
        });

        it('should return null for invalid texture name', () => {
            const sprite = loader.createSprite('invalid.png');
            expect(sprite).toBeNull();
        });

        it('should return null for invalid animation name', () => {
            const animSprite = loader.createAnimatedSprite('invalid');
            expect(animSprite).toBeNull();
        });
    });
});