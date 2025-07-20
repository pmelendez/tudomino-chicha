# Tudomino Chicha - PixiJS Demo

## 🎮 Features Demonstrated

1. **Asset Loading**: Texture atlas with domino pieces, UI elements, and animations
2. **Configuration System**: YAML-based screen layouts and sprite positioning
3. **Scene Management**: Multiple screens with different layouts
4. **Sprite Rendering**: Z-ordering, positioning, scaling, and visibility
5. **Animation System**: Smooth sprite animations and transitions
6. **Interactive Controls**: Keyboard navigation between screens

## 📺 Available Screens

- **Main Menu** (Press 1): Title screen with logo and navigation elements
- **Game Demo** (Press 2): Domino pieces (1-6) and game board layout
- **Animation Demo** (Press 3): Animated sprites with emojis and effects

## 🎹 Controls

- **1-3**: Switch between screens
- **R**: Reload application

## 🎨 Assets Used

From the provided sprite atlas (`assets/sprites.json`):
- **Domino pieces**: 1.png through 6.png (100x100 each)
- **Game logo**: td-logo.png (310x106)
- **Background elements**: background.png (1080x810), frames_players.png (1082x813)
- **UI elements**: base.png, base_line.png (113x236 each)
- **Character sprites**: CPU1.jpg, CPU2.jpg, CPU3.jpg (245x245 each)
- **Emoji sprites**: love.png, kiss.png, sunglasses2.png, sleep.png (18x19 each)

## ⚙️ Technical Implementation

- **PixiJS 7.x**: 2D rendering engine
- **Vite**: Modern build tool with hot reload
- **js-yaml**: Configuration file parsing
- **Vitest**: Testing framework
- **ES6 Modules**: Modern JavaScript architecture

## 🚀 Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 🏗️ Architecture

### Core Components
- **GameEngine**: Main application controller
- **SceneManager**: Handles screen transitions and rendering
- **ConfigManager**: Loads and manages YAML configuration
- **SpriteFactory**: Creates and configures sprites from atlas
- **TextureLoader**: Handles sprite atlas loading and parsing

### Asset Pipeline
1. TexturePacker generates `sprites.json` and `sprites.png`
2. TextureLoader parses atlas and creates PIXI textures
3. SpriteFactory creates configured sprites based on YAML settings
4. SceneManager renders sprites with proper z-ordering

### Configuration System
```yaml
screens:
  screen_name:
    background_color: "#hex"
    sprites:
      sprite_name:
        texture: "texture.png"
        position: { x: 960, y: 540 }
        z_order: 10
        scale: { x: 1.0, y: 1.0 }
        visible: true
```

## 🎭 Animations

The demo includes several animation types:
- **Floating motion**: Domino pieces gently float up and down
- **Rotation**: Slight rotational movement for visual interest
- **Pulsing scale**: Emojis scale in and out rhythmically
- **Logo bobbing**: Main logo has a gentle vertical movement

## 🧪 Testing

Comprehensive test suite covering:
- Asset loading and parsing
- Configuration validation
- Sprite creation and positioning
- Scene management
- Error handling

Run tests with: `npm run test:coverage`

## 📱 Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Performance

- 60fps target with configurable FPS limit
- Efficient sprite batching through PixiJS
- Optimized asset loading with caching
- Minimal memory footprint

---

**🎲 Welcome to Tudomino Chicha!** Enjoy exploring the demo and see how modern web technologies can create engaging 2D experiences.