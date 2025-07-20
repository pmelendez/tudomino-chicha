import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager, configManager } from '../../src/core/ConfigManager.js';
import { configLoader } from '../../src/loaders/ConfigLoader.js';

// Mock the configLoader module
vi.mock('../../src/loaders/ConfigLoader.js', () => ({
    configLoader: {
        load: vi.fn(),
        getGlobalConfig: vi.fn(),
        getInitialScreen: vi.fn(),
        getScreenConfig: vi.fn(),
        getScreenSprites: vi.fn(),
        getAppDimensions: vi.fn(),
        hexToPixiColor: vi.fn(),
        getScreenNames: vi.fn(),
        getScreenBackgroundColor: vi.fn()
    }
}));

describe('ConfigManager', () => {
    let manager;

    beforeEach(() => {
        vi.clearAllMocks();
        manager = new ConfigManager();
        
        // Setup default mock returns
        configLoader.getGlobalConfig.mockReturnValue({
            screen_width: 1920,
            screen_height: 1080,
            background_color: '#1a1a2e',
            fps_limit: 60,
            pixel_perfect: false,
            initial_screen: 'main_game'
        });
        
        configLoader.getInitialScreen.mockReturnValue('main_game');
        configLoader.getAppDimensions.mockReturnValue({ width: 1920, height: 1080 });
        configLoader.hexToPixiColor.mockReturnValue(0x1a1a2e);
        configLoader.getScreenNames.mockReturnValue(['main_game', 'test_screen']);
        configLoader.getScreenBackgroundColor.mockReturnValue(0x333333);
    });

    describe('constructor', () => {
        it('should create ConfigManager instance with initial state', () => {
            expect(manager).toBeInstanceOf(ConfigManager);
            expect(manager.currentScreen).toBe(null);
            expect(manager.globalConfig).toBe(null);
        });
    });

    describe('initialize', () => {
        it('should load config and set initial state', async () => {
            const mockGlobalConfig = {
                screen_width: 1920,
                screen_height: 1080,
                background_color: '#1a1a2e',
                fps_limit: 60,
                pixel_perfect: false,
                initial_screen: 'main_game'
            };
            
            configLoader.load.mockResolvedValue();
            configLoader.getGlobalConfig.mockReturnValue(mockGlobalConfig);
            configLoader.getInitialScreen.mockReturnValue('main_game');

            const result = await manager.initialize('/config/layouts.yml');

            expect(configLoader.load).toHaveBeenCalledWith('/config/layouts.yml');
            expect(configLoader.getGlobalConfig).toHaveBeenCalled();
            expect(configLoader.getInitialScreen).toHaveBeenCalled();
            expect(manager.globalConfig).toBe(mockGlobalConfig);
            expect(manager.currentScreen).toBe('main_game');
            expect(result).toBe(mockGlobalConfig);
        });

        it('should handle initialization errors', async () => {
            configLoader.load.mockRejectedValue(new Error('Failed to load config'));

            await expect(manager.initialize('/config/layouts.yml')).rejects.toThrow('Failed to load config');
        });
    });

    describe('switchToScreen', () => {
        beforeEach(() => {
            manager.currentScreen = 'main_game';
        });

        it('should switch to valid screen', () => {
            configLoader.getScreenConfig.mockReturnValue({ background_color: '#333333' });

            const result = manager.switchToScreen('test_screen');

            expect(configLoader.getScreenConfig).toHaveBeenCalledWith('test_screen');
            expect(manager.currentScreen).toBe('test_screen');
            expect(result).toBe(true);
        });

        it('should not switch to invalid screen', () => {
            configLoader.getScreenConfig.mockReturnValue(null);

            const result = manager.switchToScreen('nonexistent_screen');

            expect(configLoader.getScreenConfig).toHaveBeenCalledWith('nonexistent_screen');
            expect(manager.currentScreen).toBe('main_game'); // Should remain unchanged
            expect(result).toBe(false);
        });

        it('should log error for invalid screen', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            configLoader.getScreenConfig.mockReturnValue(null);

            manager.switchToScreen('nonexistent_screen');

            expect(consoleSpy).toHaveBeenCalledWith('Screen not found: nonexistent_screen');
            consoleSpy.mockRestore();
        });

        it('should log success for valid screen switch', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            configLoader.getScreenConfig.mockReturnValue({ background_color: '#333333' });

            manager.switchToScreen('test_screen');

            expect(consoleSpy).toHaveBeenCalledWith('Switched to screen: test_screen');
            consoleSpy.mockRestore();
        });
    });

    describe('getCurrentScreenConfig', () => {
        it('should return current screen config', () => {
            manager.currentScreen = 'main_game';
            const mockConfig = { background_color: '#333333' };
            configLoader.getScreenConfig.mockReturnValue(mockConfig);

            const result = manager.getCurrentScreenConfig();

            expect(configLoader.getScreenConfig).toHaveBeenCalledWith('main_game');
            expect(result).toBe(mockConfig);
        });

        it('should work with null current screen', () => {
            manager.currentScreen = null;
            configLoader.getScreenConfig.mockReturnValue(null);

            const result = manager.getCurrentScreenConfig();

            expect(configLoader.getScreenConfig).toHaveBeenCalledWith(null);
            expect(result).toBe(null);
        });
    });

    describe('getCurrentScreenSprites', () => {
        it('should return current screen sprites', () => {
            manager.currentScreen = 'main_game';
            const mockSprites = { sprite1: {}, sprite2: {} };
            configLoader.getScreenSprites.mockReturnValue(mockSprites);

            const result = manager.getCurrentScreenSprites();

            expect(configLoader.getScreenSprites).toHaveBeenCalledWith('main_game');
            expect(result).toBe(mockSprites);
        });
    });

    describe('getPixiAppConfig', () => {
        beforeEach(() => {
            manager.globalConfig = {
                screen_width: 1920,
                screen_height: 1080,
                background_color: '#1a1a2e',
                fps_limit: 60,
                pixel_perfect: false
            };
            
            // Mock window.devicePixelRatio
            Object.defineProperty(window, 'devicePixelRatio', {
                writable: true,
                value: 2
            });
        });

        it('should return PIXI app configuration', () => {
            configLoader.getAppDimensions.mockReturnValue({ width: 1920, height: 1080 });
            configLoader.hexToPixiColor.mockReturnValue(0x1a1a2e);

            const result = manager.getPixiAppConfig();

            expect(configLoader.getAppDimensions).toHaveBeenCalled();
            expect(configLoader.hexToPixiColor).toHaveBeenCalledWith('#1a1a2e');
            expect(result).toEqual({
                width: 1920,
                height: 1080,
                backgroundColor: 0x1a1a2e,
                resolution: 2,
                autoDensity: true,
                antialias: true, // !pixel_perfect
                powerPreference: 'high-performance'
            });
        });

        it('should handle null global config', () => {
            manager.globalConfig = null;
            configLoader.getAppDimensions.mockReturnValue({ width: 1920, height: 1080 });
            configLoader.hexToPixiColor.mockReturnValue(0x000000);

            const result = manager.getPixiAppConfig();

            expect(configLoader.hexToPixiColor).toHaveBeenCalledWith('#000000');
            expect(result.backgroundColor).toBe(0x000000);
            expect(result.antialias).toBe(true); // !undefined
        });

        it('should handle pixel perfect mode', () => {
            manager.globalConfig.pixel_perfect = true;
            configLoader.getAppDimensions.mockReturnValue({ width: 1920, height: 1080 });
            configLoader.hexToPixiColor.mockReturnValue(0x1a1a2e);

            const result = manager.getPixiAppConfig();

            expect(result.antialias).toBe(false); // !true
        });

        it('should fallback to resolution 1 when devicePixelRatio unavailable', () => {
            delete window.devicePixelRatio;
            configLoader.getAppDimensions.mockReturnValue({ width: 1920, height: 1080 });
            configLoader.hexToPixiColor.mockReturnValue(0x1a1a2e);

            const result = manager.getPixiAppConfig();

            expect(result.resolution).toBe(1);
        });
    });

    describe('getFpsLimit', () => {
        it('should return fps limit from global config', () => {
            manager.globalConfig = { fps_limit: 120 };

            const result = manager.getFpsLimit();

            expect(result).toBe(120);
        });

        it('should return default fps limit when not set', () => {
            manager.globalConfig = {};

            const result = manager.getFpsLimit();

            expect(result).toBe(60);
        });

        it('should return default fps limit when global config is null', () => {
            manager.globalConfig = null;

            const result = manager.getFpsLimit();

            expect(result).toBe(60);
        });
    });

    describe('isPixelPerfect', () => {
        it('should return pixel perfect setting from global config', () => {
            manager.globalConfig = { pixel_perfect: true };

            const result = manager.isPixelPerfect();

            expect(result).toBe(true);
        });

        it('should return false when pixel perfect not set', () => {
            manager.globalConfig = {};

            const result = manager.isPixelPerfect();

            expect(result).toBe(false);
        });

        it('should return false when global config is null', () => {
            manager.globalConfig = null;

            const result = manager.isPixelPerfect();

            expect(result).toBe(false);
        });
    });

    describe('getAvailableScreens', () => {
        it('should return screen names from config loader', () => {
            const mockScreens = ['main_game', 'test_screen', 'settings'];
            configLoader.getScreenNames.mockReturnValue(mockScreens);

            const result = manager.getAvailableScreens();

            expect(configLoader.getScreenNames).toHaveBeenCalled();
            expect(result).toBe(mockScreens);
        });
    });

    describe('getScreenBackgroundColor', () => {
        it('should return screen background color from config loader', () => {
            configLoader.getScreenBackgroundColor.mockReturnValue(0x333333);

            const result = manager.getScreenBackgroundColor('main_game');

            expect(configLoader.getScreenBackgroundColor).toHaveBeenCalledWith('main_game');
            expect(result).toBe(0x333333);
        });
    });

    describe('singleton instance', () => {
        it('should export singleton instance', () => {
            expect(configManager).toBeInstanceOf(ConfigManager);
        });
    });
});