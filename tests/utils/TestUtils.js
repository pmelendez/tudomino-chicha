import { vi } from 'vitest';

/**
 * Utility functions for testing PixiJS components
 */

/**
 * Create a mock PIXI sprite
 * @param {Object} props - Initial properties
 * @returns {Object} Mock sprite object
 */
export function createMockSprite(props = {}) {
    return {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        visible: true,
        alpha: 1,
        rotation: 0,
        zIndex: 0,
        name: '',
        scale: { x: 1, y: 1 },
        anchor: { 
            x: 0.5, 
            y: 0.5, 
            set: vi.fn() 
        },
        texture: null,
        tint: 0xffffff,
        ...props
    };
}

/**
 * Create a mock PIXI animated sprite
 * @param {Object} props - Initial properties
 * @returns {Object} Mock animated sprite object
 */
export function createMockAnimatedSprite(props = {}) {
    return {
        ...createMockSprite(),
        textures: [],
        animationSpeed: 0.1,
        loop: true,
        playing: false,
        currentFrame: 0,
        totalFrames: 0,
        play: vi.fn(),
        stop: vi.fn(),
        gotoAndPlay: vi.fn(),
        gotoAndStop: vi.fn(),
        ...props
    };
}

/**
 * Create a mock PIXI texture
 * @param {Object} props - Initial properties
 * @returns {Object} Mock texture object
 */
export function createMockTexture(props = {}) {
    return {
        width: 32,
        height: 32,
        baseTexture: {
            width: 32,
            height: 32,
            valid: true
        },
        frame: {
            x: 0,
            y: 0,
            width: 32,
            height: 32
        },
        valid: true,
        ...props
    };
}

/**
 * Create a mock PIXI container
 * @param {Object} props - Initial properties
 * @returns {Object} Mock container object
 */
export function createMockContainer(props = {}) {
    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visible: true,
        alpha: 1,
        rotation: 0,
        scale: { x: 1, y: 1 },
        children: [],
        addChild: vi.fn(),
        removeChild: vi.fn(),
        removeChildren: vi.fn(),
        getChildAt: vi.fn(),
        getChildIndex: vi.fn(),
        setChildIndex: vi.fn(),
        sortableChildren: false,
        ...props
    };
}

/**
 * Create a mock PIXI application
 * @param {Object} props - Initial properties
 * @returns {Object} Mock PIXI application
 */
export function createMockPixiApp(props = {}) {
    return {
        stage: createMockContainer(),
        renderer: {
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            render: vi.fn(),
            resize: vi.fn()
        },
        screen: {
            width: 800,
            height: 600
        },
        view: document.createElement('canvas'),
        ticker: {
            add: vi.fn(),
            remove: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            speed: 1,
            deltaTime: 1
        },
        destroy: vi.fn(),
        resize: vi.fn(),
        ...props
    };
}

/**
 * Create a mock spritesheet
 * @param {Object} frameData - Frame data
 * @param {Object} animationData - Animation data
 * @returns {Object} Mock spritesheet
 */
export function createMockSpritesheet(frameData = {}, animationData = {}) {
    const textures = {};
    const animations = {};

    // Create mock textures for frames
    Object.keys(frameData).forEach(frameName => {
        textures[frameName] = createMockTexture(frameData[frameName]);
    });

    // Create mock animations
    Object.keys(animationData).forEach(animName => {
        animations[animName] = animationData[animName].map(frameName => 
            textures[frameName] || createMockTexture()
        );
    });

    return {
        textures,
        animations,
        parse: vi.fn().mockResolvedValue(),
        destroy: vi.fn()
    };
}

/**
 * Setup comprehensive PIXI mocks for testing
 * @returns {Object} Collection of mock objects
 */
export function setupPixiMocks() {
    const mockTexture = createMockTexture();
    const mockSprite = createMockSprite();
    const mockAnimatedSprite = createMockAnimatedSprite();
    const mockContainer = createMockContainer();
    const mockSpritesheet = createMockSpritesheet();

    // Mock PIXI module
    const pixiMocks = {
        Texture: {
            from: vi.fn().mockReturnValue(mockTexture),
            fromURL: vi.fn().mockResolvedValue(mockTexture),
            EMPTY: mockTexture
        },
        Sprite: vi.fn().mockReturnValue(mockSprite),
        AnimatedSprite: vi.fn().mockReturnValue(mockAnimatedSprite),
        Container: vi.fn().mockReturnValue(mockContainer),
        Spritesheet: vi.fn().mockReturnValue(mockSpritesheet),
        Graphics: vi.fn().mockReturnValue({
            ...mockContainer,
            beginFill: vi.fn().mockReturnThis(),
            endFill: vi.fn().mockReturnThis(),
            drawRect: vi.fn().mockReturnThis(),
            drawCircle: vi.fn().mockReturnThis(),
            lineStyle: vi.fn().mockReturnThis(),
            moveTo: vi.fn().mockReturnThis(),
            lineTo: vi.fn().mockReturnThis(),
            clear: vi.fn().mockReturnThis()
        }),
        Text: vi.fn().mockReturnValue({
            ...mockContainer,
            text: '',
            style: {},
            anchor: { set: vi.fn() }
        }),
        Application: vi.fn().mockReturnValue(createMockPixiApp())
    };

    return {
        mockTexture,
        mockSprite,
        mockAnimatedSprite,
        mockContainer,
        mockSpritesheet,
        pixiMocks
    };
}

/**
 * Create mock sprite configuration for testing
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Mock sprite configuration
 */
export function createMockSpriteConfig(overrides = {}) {
    return {
        texture: 'test.png',
        position: { x: 100, y: 100 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        visible: true,
        z_order: 1,
        alpha: 1,
        anchor: { x: 0.5, y: 0.5 },
        ...overrides
    };
}

/**
 * Create mock screen configuration for testing
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Mock screen configuration
 */
export function createMockScreenConfig(overrides = {}) {
    return {
        background_color: '#000000',
        sprites: {
            background: createMockSpriteConfig({
                texture: 'bg.png',
                position: { x: 400, y: 300 },
                z_order: 1
            }),
            player: createMockSpriteConfig({
                texture: 'player.png',
                position: { x: 100, y: 100 },
                z_order: 10
            })
        },
        ...overrides
    };
}

/**
 * Create mock global configuration for testing
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Mock global configuration
 */
export function createMockGlobalConfig(overrides = {}) {
    return {
        screen_width: 800,
        screen_height: 600,
        background_color: '#000000',
        fps_limit: 60,
        pixel_perfect: false,
        initial_screen: 'main',
        ...overrides
    };
}

/**
 * Create comprehensive mock configuration for testing
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Complete mock configuration
 */
export function createMockConfig(overrides = {}) {
    return {
        global: createMockGlobalConfig(overrides.global),
        screens: {
            main: createMockScreenConfig(overrides.screens?.main),
            menu: createMockScreenConfig({
                background_color: '#333333',
                sprites: {
                    logo: createMockSpriteConfig({
                        texture: 'logo.png',
                        position: { x: 400, y: 200 }
                    })
                },
                ...overrides.screens?.menu
            }),
            ...overrides.screens
        }
    };
}

/**
 * Wait for next tick (useful for async testing)
 * @returns {Promise<void>}
 */
export function nextTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock console methods and return restore function
 * @param {string[]} methods - Console methods to mock
 * @returns {Function} Restore function
 */
export function mockConsole(methods = ['log', 'warn', 'error']) {
    const originalMethods = {};
    const mocks = {};

    methods.forEach(method => {
        originalMethods[method] = console[method];
        mocks[method] = vi.fn();
        console[method] = mocks[method];
    });

    return {
        mocks,
        restore: () => {
            methods.forEach(method => {
                console[method] = originalMethods[method];
            });
        }
    };
}