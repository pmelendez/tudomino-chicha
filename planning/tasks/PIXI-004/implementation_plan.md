# PIXI-004: Core Rendering Engine - Implementation Plan

## Overview
Create the main game rendering and scene management system that ties together asset loading and configuration to provide a complete rendering engine.

## Implementation Steps

### Step 1: Scene Manager
**File:** `src/core/SceneManager.js`
```javascript
import * as PIXI from 'pixi.js';
import { configManager } from './ConfigManager.js';
import { spriteFactory } from '../loaders/SpriteFactory.js';
import { createScreenSprites } from '../utils/ConfigUtils.js';

export class SceneManager {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
        this.scenes = new Map();
        this.transitionSpeed = 0.5;
    }

    async switchToScreen(screenName) {
        if (configManager.switchToScreen(screenName)) {
            await this.loadCurrentScreen();
            return true;
        }
        return false;
    }

    async loadCurrentScreen() {
        // Clear current scene
        this.app.stage.removeChildren();
        
        // Set background
        const bgColor = configManager.getScreenBackgroundColor(configManager.currentScreen);
        this.app.renderer.backgroundColor = bgColor;
        
        // Create sprites
        const sprites = createScreenSprites(spriteFactory);
        
        // Setup z-index sorting
        this.app.stage.sortableChildren = true;
        
        // Add sprites
        sprites.forEach(sprite => this.app.stage.addChild(sprite));
        
        console.log(`Loaded screen: ${configManager.currentScreen}`);
    }
}
```

### Step 2: Game Engine Core
**File:** `src/core/GameEngine.js`
```javascript
import * as PIXI from 'pixi.js';
import { configManager } from './ConfigManager.js';
import { spriteFactory } from '../loaders/SpriteFactory.js';
import { SceneManager } from './SceneManager.js';

export class GameEngine {
    constructor() {
        this.app = null;
        this.sceneManager = null;
        this.isInitialized = false;
        this.updateCallbacks = [];
    }

    async initialize(configPath = '/config/layouts.yml') {
        try {
            // Load configuration
            await configManager.initialize(configPath);
            
            // Create PIXI application
            const appConfig = configManager.getPixiAppConfig();
            this.app = new PIXI.Application(appConfig);
            
            // Initialize sprite factory
            await spriteFactory.initialize();
            
            // Create scene manager
            this.sceneManager = new SceneManager(this.app);
            
            // Load initial screen
            await this.sceneManager.loadCurrentScreen();
            
            // Setup update loop
            this.app.ticker.add(this.update.bind(this));
            
            this.isInitialized = true;
            console.log('GameEngine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize GameEngine:', error);
            throw error;
        }
    }

    update(deltaTime) {
        this.updateCallbacks.forEach(callback => callback(deltaTime));
    }

    addUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
    }

    removeUpdateCallback(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index > -1) {
            this.updateCallbacks.splice(index, 1);
        }
    }

    getCanvas() {
        return this.app?.view || null;
    }

    switchScreen(screenName) {
        return this.sceneManager?.switchToScreen(screenName) || false;
    }
}

// Export singleton
export const gameEngine = new GameEngine();
```

### Step 3: Updated Main Application
**File:** `src/main.js` (Final version)
```javascript
import { gameEngine } from './core/GameEngine.js';
import { createLoadingScreen } from './utils/LoadingUtils.js';

async function initializeApp() {
    try {
        // Create temporary app for loading screen
        const loadingApp = new PIXI.Application({
            width: 1920,
            height: 1080,
            backgroundColor: 0x000000
        });
        
        document.getElementById('game-container').appendChild(loadingApp.view);
        
        const loadingScreen = createLoadingScreen(loadingApp);
        loadingApp.stage.addChild(loadingScreen);
        
        // Initialize game engine
        await gameEngine.initialize('/config/layouts.yml');
        
        // Replace loading app with game app
        document.getElementById('game-container').removeChild(loadingApp.view);
        document.getElementById('game-container').appendChild(gameEngine.getCanvas());
        
        // Cleanup loading app
        loadingApp.destroy();
        
        // Setup development controls
        setupDevControls();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

function setupDevControls() {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'r' || event.key === 'R') {
            location.reload(); // Reload for development
        }
    });
    
    console.log('Press R to reload, 1-9 to switch screens');
}

initializeApp();
```

## Success Criteria
1. ✅ GameEngine initializes without errors
2. ✅ SceneManager loads screens correctly
3. ✅ Sprites render in correct z-order
4. ✅ Update loop runs smoothly
5. ✅ Screen switching works
6. ✅ Performance is acceptable (60fps)

## Dependencies
- **Requires:** PIXI-001, PIXI-002, PIXI-003
- **Enables:** PIXI-006 (Example Implementation)

## Estimated Time: 45-60 minutes