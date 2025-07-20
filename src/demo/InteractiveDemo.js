import { gameEngine } from '../core/GameEngine.js';
import { configManager } from '../core/ConfigManager.js';

export class InteractiveDemo {
    constructor() {
        this.animationTime = 0;
        this.setupControls();
        this.setupAnimations();
    }

    setupControls() {
        window.addEventListener('keydown', (event) => {
            switch(event.key) {
                case '1':
                    gameEngine.switchScreen('main_menu');
                    console.log('Switched to Main Menu');
                    break;
                case '2':
                    gameEngine.switchScreen('game_demo');
                    console.log('Switched to Game Demo');
                    break;
                case '3':
                    gameEngine.switchScreen('animation_demo');
                    console.log('Switched to Animation Demo');
                    break;
                case 'r':
                case 'R':
                    location.reload();
                    break;
            }
        });
    }

    setupAnimations() {
        gameEngine.addUpdateCallback((deltaTime) => {
            this.animateSprites(deltaTime);
        });
    }

    animateSprites(deltaTime) {
        this.animationTime += deltaTime * 0.01;
        const stage = gameEngine.app?.stage;
        
        if (!stage) return;
        
        // Find and animate domino pieces with gentle floating motion
        stage.children.forEach(sprite => {
            if (sprite.name && sprite.name.includes('domino')) {
                // Gentle floating animation
                const originalY = sprite._originalY || sprite.y;
                sprite._originalY = originalY;
                sprite.y = originalY + Math.sin(this.animationTime + sprite.x * 0.01) * 5;
                
                // Slight rotation
                sprite.rotation = Math.sin(this.animationTime * 0.5 + sprite.x * 0.001) * 0.1;
            }
            
            // Animate emojis with different patterns
            if (sprite.name && sprite.name.includes('emoji')) {
                const originalScale = sprite._originalScale || sprite.scale.x;
                sprite._originalScale = originalScale;
                
                // Pulsing scale animation
                const scaleFactor = 1 + Math.sin(this.animationTime * 2 + sprite.x * 0.01) * 0.2;
                sprite.scale.set(originalScale * scaleFactor);
                
                // Slight rotation for emojis
                sprite.rotation = Math.sin(this.animationTime + sprite.y * 0.01) * 0.3;
            }
            
            // Animate logo with gentle bob
            if (sprite.name && sprite.name.includes('logo')) {
                const originalY = sprite._originalY || sprite.y;
                sprite._originalY = originalY;
                sprite.y = originalY + Math.sin(this.animationTime * 0.8) * 10;
            }
        });
    }
}