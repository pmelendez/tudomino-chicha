# PIXI-001: Project Foundation Setup - Implementation Plan

## Overview
Initialize a modern PixiJS project with Vite build system, proper project structure, and development environment.

## Technical Requirements
- PixiJS v7.x or later
- Vite as build tool (preferred over Webpack for speed and simplicity)
- Modern JavaScript (ES6+ modules)
- Development server with hot reload
- Production build capability

## Implementation Steps

### Step 1: Initialize Package.json
```bash
npm init -y
```
**Outcome:** Basic package.json with project metadata

### Step 2: Install Core Dependencies
```bash
# Core framework
npm install pixi.js@^7.0.0

# Build tool
npm install --save-dev vite

# YAML parsing for config
npm install js-yaml
npm install --save-dev @types/js-yaml

# Testing framework
npm install --save-dev vitest jsdom

# Development utilities
npm install --save-dev @vitejs/plugin-legacy
```

### Step 3: Create Project Structure
```
/
├── src/
│   ├── main.js              # Application entry point
│   ├── core/               # Core engine classes
│   ├── loaders/            # Asset and config loaders
│   ├── scenes/             # Scene management
│   └── utils/              # Utility functions
├── config/
│   └── layouts.yml         # Example layout configuration
├── assets/                 # Already exists with sprites
├── public/                 # Static assets
├── tests/                  # Test files
├── dist/                   # Build output
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
└── package.json
```

### Step 4: Create Vite Configuration
**File:** `vite.config.js`
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    hot: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
```

### Step 5: Create HTML Entry Point
**File:** `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tudomino Chicha</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        #game-canvas {
            border: 1px solid #333;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="game-canvas"></canvas>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Step 6: Create Basic Application Entry Point
**File:** `src/main.js`
```javascript
import * as PIXI from 'pixi.js';

// Basic PIXI application setup
const app = new PIXI.Application({
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
});

// Add canvas to DOM
document.getElementById('game-container').appendChild(app.view);

// Basic text for testing
const text = new PIXI.Text('PixiJS Project Initialized!', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffffff,
    align: 'center'
});

text.anchor.set(0.5);
text.x = app.screen.width / 2;
text.y = app.screen.height / 2;

app.stage.addChild(text);

console.log('PixiJS Application initialized successfully');
```

### Step 7: Update Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

### Step 8: Create Basic Test Setup
**File:** `tests/setup.js`
```javascript
import { beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment for PIXI
beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost',
        pretendToBeVisual: true,
        resources: 'usable'
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
});
```

**File:** `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.js']
    }
});
```

## Success Criteria
1. ✅ npm install completes without errors
2. ✅ npm run dev starts development server
3. ✅ Browser shows "PixiJS Project Initialized!" message
4. ✅ Hot reload works when modifying main.js
5. ✅ npm run build creates production build
6. ✅ npm test runs test suite

## Dependencies for Next Tasks
- Provides foundation for PIXI-002 (Asset Loading)
- Provides foundation for PIXI-003 (Configuration System) 
- Provides foundation for PIXI-005 (Testing Infrastructure)

## Estimated Time
- 30-45 minutes for experienced developer
- Include time for testing each step

## Risk Factors
- Version compatibility between PixiJS and Vite
- Canvas rendering issues in different browsers
- Module resolution problems

## Testing Strategy
- Manual: Run dev server and verify rendering
- Automated: Basic unit test for application initialization
- Build: Verify production build works correctly