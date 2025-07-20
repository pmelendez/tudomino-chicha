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