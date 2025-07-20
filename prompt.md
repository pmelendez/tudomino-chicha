
Below there is a prompt for a programming task. I need you to approach that task in five stages.

Planning: You will check ./planning/board.md and select the best task or group of tasks to work checking the dependencies. You will create a detailed implementation plan for each of those tasks in ./planning/tasks/task{id}/implementation_plan.md. Ultrathink this stage as it is critical to the project.
Development:  You will create a feature branch from `agent-dev` to work. You will spawn independent subagents to address each of the tasks that can be worked in parallel, following the implementation plan create in the Planning stage. After each task, the subagent should create tests to validate their work and should iterate until all tests pass.
Validate: Using Playwright validate different functionality of the project. You will have access to a MCP server for this. Create all the bugs in ./planning/bugs.md
Fix: Iterate using playwright to address the bugs found in the Validate stage. At the end of this phase all the project should be concluded and working.
Update: After all tests are passing, commit your work, merge to `agent_dev` and create a PR from `agent_dev` to `dev`.

---

## Task Description
Initialize a complete PixiJS project with modern build tools, JavaScript configuration, and development server setup. This forms the foundation for all subsequent development work. We will create a system that will load assests to the screen using a texture packer generated JSON (./assets/sprites.json) corresponding to a texture file (./assets/sprites.png). We will control the coordinates and other properties of the screen on a config file (./config/layouts.yml)

## Context
The project needs to support:
- PixiJS v7+ for 2D canvas rendering
- Modern JavaScript (ES6+) for clean code organization  
- Modern build system (Vite/Webpack) for bundling and hot reload
- Development server for testing

## Requirements

### Technical Stack
- **Framework:** PixiJS v7.x or later
- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite (preferred) or Webpack
- **Package Manager:** npm or yarn
- **Testing Framework:** Jest or Vitest (for future testing tasks)
- **Visual Validation:** Playwright MCP server

### Layout.yml 
This is an example of the config file:
```yaml
global:
  screen_width: 1920
  screen_height: 1080
  background_color: "#000000"
  fps_limit: 60
  pixel_perfect: true
  initial_screen: "main_menu"

# Screen definitions
screens:
  # Main Menu Screen
  main_game:
    background_color: "#1a1a2e"
    music: "assets/audio/menu_theme.ogg"
    sprites:
      title_logo:
        texture: "background.png"
        position:
          x: 960
          y: 200
        z_order: 10
        visible: true
      
      start_button:
        texture: "base_line.png"
        position:
          x: 960
          y: 450
        z_order: 20
        visible: true

```
