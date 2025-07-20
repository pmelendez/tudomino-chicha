import { gameEngine } from './core/GameEngine.js';
import { InteractiveDemo } from './demo/InteractiveDemo.js';
import { createLoadingScreen } from './utils/LoadingUtils.js';
import * as PIXI from 'pixi.js';

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
        
        // Initialize game engine with demo configuration
        await gameEngine.initialize('/config/demo_layouts.yml');
        
        // Replace loading app with game app
        document.getElementById('game-container').removeChild(loadingApp.view);
        document.getElementById('game-container').appendChild(gameEngine.getCanvas());
        
        // Cleanup loading app
        loadingApp.destroy();
        
        // Setup demo
        const demo = new InteractiveDemo();
        
        // Show instructions
        showInstructions();
        
        console.log('Tudomino Chicha Demo Ready!');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

function showInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        color: white;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        font-family: Arial, sans-serif;
        border-radius: 5px;
        z-index: 1000;
    `;
    instructions.innerHTML = `
        <h3>🎮 Tudomino Chicha Demo</h3>
        <p><strong>1:</strong> Main Menu</p>
        <p><strong>2:</strong> Game Demo</p>
        <p><strong>3:</strong> Animation Demo</p>
        <p><strong>R:</strong> Reload</p>
        <hr style="margin: 10px 0;">
        <small>Watch for animated sprites!</small>
    `;
    document.body.appendChild(instructions);
}

initializeApp();