import { beforeAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';

beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="game-container"></div></body></html>', {
        url: 'http://localhost',
        pretendToBeVisual: true,
        resources: 'usable'
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    
    // Mock fetch for tests
    global.fetch = vi.fn();
    
    // Mock Canvas 2D context for PixiJS
    const mockContext = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1
        })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1
        })),
        setTransform: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 10 })),
        canvas: { width: 800, height: 600 }
    };

    // Mock HTMLCanvasElement methods
    if (global.HTMLCanvasElement) {
        global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
        global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,test');
    }
    
    // Mock WebGL context for PixiJS
    const mockWebGLContext = {
        canvas: { width: 800, height: 600 },
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        createShader: vi.fn(),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        useProgram: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createTexture: vi.fn(),
        bindTexture: vi.fn(),
        texParameteri: vi.fn(),
        texImage2D: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        blendFunc: vi.fn(),
        viewport: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        getUniformLocation: vi.fn(() => {}),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        uniform4f: vi.fn(),
        uniformMatrix4fv: vi.fn()
    };

    // Override getContext to return mock WebGL context when requested
    if (global.HTMLCanvasElement) {
        const originalGetContext = global.HTMLCanvasElement.prototype.getContext;
        global.HTMLCanvasElement.prototype.getContext = vi.fn((contextType, options) => {
            if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
                return mockWebGLContext;
            }
            return mockContext;
        });
    }
    
    // Mock Image constructor for texture loading
    global.Image = class MockImage {
        constructor() {
            this.onload = null;
            this.onerror = null;
            this.width = 100;
            this.height = 100;
        }
        
        set src(value) {
            this._src = value;
            // Simulate successful image load
            setTimeout(() => {
                if (this.onload) {
                    this.onload();
                }
            }, 0);
        }
        
        get src() {
            return this._src;
        }
    };
});