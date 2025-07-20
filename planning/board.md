# Project Task Board

## High Priority Tasks

### Task 1: Project Foundation Setup
**ID:** PIXI-001
**Status:** Pending
**Dependencies:** None
**Description:** Initialize PixiJS project with modern build tools and development environment

#### Subtasks:
- Initialize npm/package.json
- Install PixiJS v7+, Vite, and development dependencies
- Create basic project structure
- Setup Vite configuration
- Create basic HTML entry point

### Task 2: Asset Loading System
**ID:** PIXI-002  
**Status:** Pending
**Dependencies:** PIXI-001
**Description:** Implement texture atlas loading system for sprites.json/sprites.png

#### Subtasks:
- Create TextureLoader class to handle sprite atlas
- Implement sprite frame extraction from atlas
- Handle async loading and error cases
- Create sprite factory system

### Task 3: Configuration System
**ID:** PIXI-003
**Status:** Pending  
**Dependencies:** PIXI-001
**Description:** Implement YAML-based layout configuration system

#### Subtasks:
- Install js-yaml dependency
- Create ConfigLoader class
- Implement screen definition parsing
- Handle global settings (screen size, background, fps)
- Create sprite positioning system from config

### Task 4: Core Rendering Engine
**ID:** PIXI-004
**Status:** Pending
**Dependencies:** PIXI-002, PIXI-003
**Description:** Create the main game rendering and scene management system

#### Subtasks:
- Initialize PIXI Application with config settings
- Create Screen/Scene management system
- Implement sprite rendering from layout config
- Handle z-ordering and visibility
- Setup update loop

### Task 5: Testing Infrastructure
**ID:** PIXI-005
**Status:** Pending
**Dependencies:** PIXI-001
**Description:** Setup testing framework and initial tests

#### Subtasks:
- Install Vitest testing framework
- Create test utilities for PIXI testing
- Write unit tests for core classes
- Setup test configuration

### Task 6: Example Implementation
**ID:** PIXI-006
**Status:** Pending
**Dependencies:** PIXI-004
**Description:** Create working example using existing assets

#### Subtasks:
- Create example layouts.yml using available sprites
- Implement main_game screen with domino assets
- Test asset loading and rendering
- Verify configuration system works

## Task Dependencies Graph
```
PIXI-001 (Foundation)
├── PIXI-002 (Asset Loading)
├── PIXI-003 (Configuration)
├── PIXI-005 (Testing)
└── PIXI-004 (Rendering) ← depends on PIXI-002, PIXI-003
    └── PIXI-006 (Example) ← depends on PIXI-004
```

## Parallel Development Opportunities
- PIXI-002 and PIXI-003 can be developed in parallel after PIXI-001
- PIXI-005 can be developed alongside other tasks
- Testing can be iterative throughout development