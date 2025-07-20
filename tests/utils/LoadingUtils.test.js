import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as PIXI from 'pixi.js';
import { createLoadingScreen, preloadAssets } from '../../src/utils/LoadingUtils.js';

// Mock PIXI
vi.mock('pixi.js', () => ({
    Container: vi.fn(() => ({
        addChild: vi.fn()
    })),
    Graphics: vi.fn(() => ({
        beginFill: vi.fn().mockReturnThis(),
        drawRect: vi.fn().mockReturnThis(),
        endFill: vi.fn().mockReturnThis()
    })),
    Text: vi.fn((text, style) => ({
        anchor: { set: vi.fn() },
        x: 0,
        y: 0
    })),
    Texture: {
        fromURL: vi.fn()
    }
}));

describe('LoadingUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createLoadingScreen', () => {
        it('should create loading screen container', () => {
            const mockApp = {
                screen: {
                    width: 800,
                    height: 600
                }
            };

            const mockContainer = { addChild: vi.fn() };
            const mockBackground = {
                beginFill: vi.fn().mockReturnThis(),
                drawRect: vi.fn().mockReturnThis(),
                endFill: vi.fn().mockReturnThis()
            };
            const mockText = {
                anchor: { set: vi.fn() },
                x: 0,
                y: 0
            };

            PIXI.Container.mockReturnValue(mockContainer);
            PIXI.Graphics.mockReturnValue(mockBackground);
            PIXI.Text.mockReturnValue(mockText);

            const result = createLoadingScreen(mockApp);

            expect(PIXI.Container).toHaveBeenCalled();
            expect(PIXI.Graphics).toHaveBeenCalled();
            expect(PIXI.Text).toHaveBeenCalledWith('Loading...', {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                align: 'center'
            });

            expect(mockBackground.beginFill).toHaveBeenCalledWith(0x000000);
            expect(mockBackground.drawRect).toHaveBeenCalledWith(0, 0, 800, 600);
            expect(mockBackground.endFill).toHaveBeenCalled();

            expect(mockText.anchor.set).toHaveBeenCalledWith(0.5);
            expect(mockText.x).toBe(400); // width / 2
            expect(mockText.y).toBe(300); // height / 2

            expect(mockContainer.addChild).toHaveBeenCalledTimes(2);
            expect(result).toBe(mockContainer);
        });

        it('should handle different screen dimensions', () => {
            const mockApp = {
                screen: {
                    width: 1920,
                    height: 1080
                }
            };

            const mockContainer = { addChild: vi.fn() };
            const mockBackground = {
                beginFill: vi.fn().mockReturnThis(),
                drawRect: vi.fn().mockReturnThis(),
                endFill: vi.fn().mockReturnThis()
            };
            const mockText = {
                anchor: { set: vi.fn() },
                x: 0,
                y: 0
            };

            PIXI.Container.mockReturnValue(mockContainer);
            PIXI.Graphics.mockReturnValue(mockBackground);
            PIXI.Text.mockReturnValue(mockText);

            createLoadingScreen(mockApp);

            expect(mockBackground.drawRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
            expect(mockText.x).toBe(960); // width / 2
            expect(mockText.y).toBe(540); // height / 2
        });
    });

    describe('preloadAssets', () => {
        it('should preload assets successfully', async () => {
            const assetPaths = ['image1.png', 'image2.png', 'image3.png'];
            const mockTexture = {};
            PIXI.Texture.fromURL.mockResolvedValue(mockTexture);

            const onProgress = vi.fn();

            await preloadAssets(assetPaths, onProgress);

            expect(PIXI.Texture.fromURL).toHaveBeenCalledTimes(3);
            expect(PIXI.Texture.fromURL).toHaveBeenCalledWith('image1.png');
            expect(PIXI.Texture.fromURL).toHaveBeenCalledWith('image2.png');
            expect(PIXI.Texture.fromURL).toHaveBeenCalledWith('image3.png');

            expect(onProgress).toHaveBeenCalledTimes(3);
            expect(onProgress).toHaveBeenCalledWith(1/3);
            expect(onProgress).toHaveBeenCalledWith(2/3);
            expect(onProgress).toHaveBeenCalledWith(1);
        });

        it('should handle loading failures gracefully', async () => {
            const assetPaths = ['good.png', 'bad.png', 'another-good.png'];
            const mockTexture = {};
            
            PIXI.Texture.fromURL
                .mockResolvedValueOnce(mockTexture)
                .mockRejectedValueOnce(new Error('Failed to load'))
                .mockResolvedValueOnce(mockTexture);

            const onProgress = vi.fn();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            await preloadAssets(assetPaths, onProgress);

            expect(PIXI.Texture.fromURL).toHaveBeenCalledTimes(3);
            expect(onProgress).toHaveBeenCalledTimes(3);
            expect(onProgress).toHaveBeenCalledWith(1/3);
            expect(onProgress).toHaveBeenCalledWith(2/3);
            expect(onProgress).toHaveBeenCalledWith(1);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to preload: bad.png', 
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it('should work without progress callback', async () => {
            const assetPaths = ['image1.png', 'image2.png'];
            const mockTexture = {};
            PIXI.Texture.fromURL.mockResolvedValue(mockTexture);

            await preloadAssets(assetPaths);

            expect(PIXI.Texture.fromURL).toHaveBeenCalledTimes(2);
        });

        it('should handle empty asset array', async () => {
            const onProgress = vi.fn();

            await preloadAssets([], onProgress);

            expect(PIXI.Texture.fromURL).not.toHaveBeenCalled();
            expect(onProgress).not.toHaveBeenCalled();
        });

        it('should handle single asset', async () => {
            const assetPaths = ['single.png'];
            const mockTexture = {};
            PIXI.Texture.fromURL.mockResolvedValue(mockTexture);

            const onProgress = vi.fn();

            await preloadAssets(assetPaths, onProgress);

            expect(PIXI.Texture.fromURL).toHaveBeenCalledWith('single.png');
            expect(onProgress).toHaveBeenCalledWith(1);
        });

        it('should handle all assets failing to load', async () => {
            const assetPaths = ['bad1.png', 'bad2.png'];
            PIXI.Texture.fromURL.mockRejectedValue(new Error('Load failed'));

            const onProgress = vi.fn();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            await preloadAssets(assetPaths, onProgress);

            expect(onProgress).toHaveBeenCalledWith(0.5);
            expect(onProgress).toHaveBeenCalledWith(1);
            expect(consoleSpy).toHaveBeenCalledTimes(2);

            consoleSpy.mockRestore();
        });
    });
});