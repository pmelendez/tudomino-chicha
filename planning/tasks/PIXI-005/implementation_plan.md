# PIXI-005: Testing Infrastructure - Implementation Plan

## Overview
Setup comprehensive testing framework with unit tests, integration tests, and visual validation for the PixiJS project.

## Implementation Steps

### Step 1: Test Configuration
**File:** `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'tests/', 'dist/']
        }
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    }
});
```

### Step 2: Test Setup
**File:** `tests/setup.js`
```javascript
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
});
```

### Step 3: Core Tests
**File:** `tests/core/GameEngine.test.js`
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../../src/core/GameEngine.js';

describe('GameEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new GameEngine();
        
        // Mock fetch responses
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve('global:\n  screen_width: 800\n  screen_height: 600\n  initial_screen: "test"\nscreens:\n  test:\n    sprites: {}')
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    frames: {},
                    animations: {},
                    meta: { image: "test.png" }
                })
            });
    });

    it('should create GameEngine instance', () => {
        expect(engine).toBeInstanceOf(GameEngine);
        expect(engine.isInitialized).toBe(false);
    });

    // More tests would be added here
});
```

### Step 4: Loader Tests
**File:** `tests/loaders/TextureLoader.test.js`
**File:** `tests/loaders/ConfigLoader.test.js`
(Already created in previous tasks)

### Step 5: Test Scripts
Update `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Success Criteria
1. ✅ All unit tests pass
2. ✅ Test coverage > 80%
3. ✅ Integration tests work
4. ✅ Mocked assets load correctly

## Dependencies
- **Requires:** PIXI-001 (Project Foundation)
- **Runs with:** All other tasks

## Estimated Time: 30-45 minutes