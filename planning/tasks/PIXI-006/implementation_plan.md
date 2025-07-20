# PIXI-006: Example Implementation - Implementation Plan

## Overview
Create a working example using the existing domino assets to demonstrate the complete system functionality.

## Implementation Steps

### Step 1: Enhanced Configuration
**File:** `config/layouts.yml` (Enhanced version)
```yaml
global:
  screen_width: 1920
  screen_height: 1080
  background_color: "#0a0a0a"
  fps_limit: 60
  pixel_perfect: false
  initial_screen: "main_menu"

screens:
  main_menu:
    background_color: "#1a1a2e"
    sprites:
      background:
        texture: "background.png"
        position: { x: 960, y: 540 }
        z_order: 1
        scale: { x: 1.78, y: 1.33 }
        
      logo:
        texture: "td-logo.png"
        position: { x: 960, y: 250 }
        z_order: 10
        
      start_button:
        texture: "base_line.png"
        position: { x: 960, y: 600 }
        z_order: 20

  game_demo:
    background_color: "#2a2a4e"
    sprites:
      player_frames:
        texture: "frames_players.png"
        position: { x: 960, y: 540 }
        z_order: 1
        
      domino_1:
        texture: "1.png"
        position: { x: 700, y: 400 }
        z_order: 10
        
      domino_2:
        texture: "2.png"
        position: { x: 800, y: 400 }
        z_order: 10
        
      domino_3:
        texture: "3.png"
        position: { x: 900, y: 400 }
        z_order: 10
        
      cpu_animation:
        texture: "CPU1.jpg"
        position: { x: 1200, y: 400 }
        z_order: 15
        
      game_base:
        texture: "base.png"
        position: { x: 960, y: 700 }
        z_order: 5

  animation_demo:
    background_color: "#3a3a6e"
    sprites:
      cpu_player:
        texture: "CPU1.jpg"
        position: { x: 960, y: 540 }
        z_order: 10
        scale: { x: 2, y: 2 }
```

### Step 2: Interactive Demo Features
**File:** `src/demo/InteractiveDemo.js`
```javascript
import { gameEngine } from '../core/GameEngine.js';
import { configManager } from '../core/ConfigManager.js';

export class InteractiveDemo {
    constructor() {
        this.setupControls();
        this.setupAnimations();
    }

    setupControls() {
        window.addEventListener('keydown', (event) => {
            switch(event.key) {
                case '1':
                    gameEngine.switchScreen('main_menu');
                    break;
                case '2':
                    gameEngine.switchScreen('game_demo');
                    break;
                case '3':
                    gameEngine.switchScreen('animation_demo');
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
            // Add smooth animations here
            this.animateSprites(deltaTime);
        });
    }

    animateSprites(deltaTime) {
        const stage = gameEngine.app.stage;
        
        // Find and animate domino pieces
        stage.children.forEach(sprite => {
            if (sprite.name && sprite.name.includes('domino')) {
                sprite.rotation += 0.01 * deltaTime;
            }
        });
    }
}
```

### Step 3: Updated Main with Demo
**File:** `src/main.js` (Final with demo)
```javascript
import { gameEngine } from './core/GameEngine.js';
import { InteractiveDemo } from './demo/InteractiveDemo.js';
import { createLoadingScreen } from './utils/LoadingUtils.js';

async function initializeApp() {
    try {
        // Show loading
        showLoadingMessage();
        
        // Initialize game engine
        await gameEngine.initialize('/config/layouts.yml');
        
        // Setup demo
        const demo = new InteractiveDemo();
        
        // Add canvas to DOM
        document.getElementById('game-container').appendChild(gameEngine.getCanvas());
        
        // Show instructions
        showInstructions();
        
        console.log('Tudomino Chicha Demo Ready!');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError(error.message);
    }
}

function showLoadingMessage() {
    const container = document.getElementById('game-container');
    container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Loading Tudomino Chicha...</div>';
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
        <h3>Tudomino Chicha Demo</h3>
        <p>Press 1: Main Menu</p>
        <p>Press 2: Game Demo</p>
        <p>Press 3: Animation Demo</p>
        <p>Press R: Reload</p>
    `;
    document.body.appendChild(instructions);
}

function showError(message) {
    const container = document.getElementById('game-container');
    container.innerHTML = `<div style="color: red; text-align: center; padding: 50px;">Error: ${message}</div>`;
}

initializeApp();
```

### Step 4: Create Demo README
**File:** `DEMO.md`
```markdown
# Tudomino Chicha - PixiJS Demo

## Features Demonstrated

1. **Asset Loading**: Texture atlas with domino pieces, UI elements, and animations
2. **Configuration System**: YAML-based screen layouts and sprite positioning
3. **Scene Management**: Multiple screens with different layouts
4. **Sprite Rendering**: Z-ordering, positioning, scaling, and visibility
5. **Animation System**: Smooth sprite animations and transitions

## Available Screens

- **Main Menu** (Press 1): Title screen with logo and navigation
- **Game Demo** (Press 2): Domino pieces and game board layout
- **Animation Demo** (Press 3): Animated sprites and effects

## Controls

- `1-3`: Switch between screens
- `R`: Reload application

## Assets Used

From the provided sprite atlas:
- Domino pieces (1.png through 6.png)
- Game logo (td-logo.png)
- Background elements (background.png, frames_players.png)
- UI elements (base.png, base_line.png)
- Character animations (CPU1.jpg, CPU2.jpg, CPU3.jpg)

## Technical Implementation

- **PixiJS 7.x**: 2D rendering engine
- **Vite**: Modern build tool with hot reload
- **js-yaml**: Configuration file parsing
- **Vitest**: Testing framework
- **ES6 Modules**: Modern JavaScript architecture
```

## Success Criteria
1. ✅ All screens load and display correctly
2. ✅ Sprites are positioned according to configuration
3. ✅ Screen switching works smoothly
4. ✅ Animations run at stable framerate
5. ✅ All existing assets are utilized
6. ✅ Demo is interactive and responsive
7. ✅ Instructions are clear and helpful

## Dependencies
- **Requires:** PIXI-001, PIXI-002, PIXI-003, PIXI-004

## Estimated Time: 30-45 minutes