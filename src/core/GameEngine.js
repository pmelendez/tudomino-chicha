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