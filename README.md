# Verto Engine Web

A full web-based game engine with Blueprints-like node scripting system.

## Status

**Phase 0, 1, 2, 3, 4, 5 & 6 Complete**: Foundation, ECS core, Engine loop, Render backend, Asset pipeline, Input system, and Physics 2D are implemented and tested.

- ✅ Core math (Vec2, Vec3, Mat4, Quat, Color)
- ✅ Deterministic Time system
- ✅ Serialization helpers
- ✅ ECS World with entities, components, queries, and systems
- ✅ Engine.step(dt) with fixed timestep accumulator
- ✅ Scene structure (contains ECS World)
- ✅ Prefab system (component templates)
- ✅ Project model (scenes + prefabs)
- ✅ WebGL2 renderer with context management
- ✅ Shader compilation system
- ✅ Mesh and texture systems
- ✅ Sprite batch renderer
- ✅ Camera system (2D orthographic)
- ✅ Material system
- ✅ Headless renderer for testing
- ✅ Asset type system (Texture, AudioClip, Mesh, SpriteSheet, Font)
- ✅ IndexedDB asset cache
- ✅ Asset importer with type detection
- ✅ Asset pipeline (convert to runtime-ready forms)
- ✅ Async asset loaders
- ✅ Input state tracking (keyboard, mouse, touch)
- ✅ Action bindings system
- ✅ Input manager with event handling
- ✅ Rigid body physics (static, dynamic, kinematic)
- ✅ Colliders (AABB, Circle)
- ✅ Broadphase collision detection (spatial grid)
- ✅ Narrowphase collision detection
- ✅ Collision resolution (impulse-based solver)
- ✅ Collision events (enter/exit)
- ✅ Raycast support
- ✅ Comprehensive test suite (198 tests passing)

**Current Progress**: 8 of 10 phases complete. Engine node packs and auto-generation implemented. Next: Phase 9 - Animation/UI Runtime & Phase 10 - Editor UI.

## Development

### Setup

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### Run Dev Server

```bash
npm run dev
```

Note: Editor UI is not yet implemented (Phase 10). The dev server currently shows a placeholder.

## Architecture

### Phase 0 - Foundation ✅
- Core math utilities
- Deterministic time system
- Serialization helpers
- ID generation
- Event system
- Error types

### Phase 1 - ECS Core ✅
- Entity creation/destruction
- Component storage
- Query system
- System management with priorities
- Deterministic updates

### Phase 2 - Engine Loop + Scenes + Prefabs ✅
- Engine.step(dt) with fixed timestep
- Scene structure
- Prefab system

### Phase 3 - Render Backend (WebGL2) ✅
- WebGL2 context management
- Shader compilation system
- Mesh/Geometry system
- Texture loading
- Sprite batch renderer
- Camera system (2D orthographic)
- Material system
- Headless renderer for testing

### Phase 4 - Asset Pipeline ✅
- Asset type system (Texture, AudioClip, Mesh, SpriteSheet, Font, Prefab, Scene)
- IndexedDB caching for asset metadata
- Asset importer with automatic type detection
- Asset pipeline (converts imported files to runtime-ready forms)
- Async asset loaders with GUID resolution
- File API support with test mocks

### Phase 5 - Input System ✅
- Keyboard input with KeyCode enum
- Mouse input (position, buttons, wheel)
- Touch input (multi-touch support)
- Input state tracking (pressed/held/released)
- Action bindings (map keys/buttons to game actions)
- Input manager with DOM event handling
- Frame-based state clearing

### Phase 6 - Physics 2D
- Rigid bodies
- Colliders (AABB, Circle)
- Collision detection
- Simple impulse resolution

### Phase 7 - Scripting: Blueprints-like Graph Engine ✅
- Node graph model (nodes, pins, edges)
- Pin type system (Exec, Bool, Int, Float, String, Vec2, Vec3, Color, EntityRef, AssetRef, Array, Any)
- Node registry with categories and search
- Graph validator (missing pins, type mismatch, cycles, latent in pure functions)
- Graph compiler (execution plan with topological sort)
- Graph runtime with event dispatch
- Latent action scheduler (yield/resume)
- Debugger (breakpoints, step, watch values)
- Graph serialization
- Standard library nodes (Flow, Math, Time)
- Comprehensive test suite

### Phase 8 - Engine Node Packs ✅
- API Catalog system (describes engine functions)
- Auto Node Generation (creates nodes from API catalog)
- ECS nodes (Spawn Entity, Destroy Entity, Get/Set Component)
- Transform nodes (Get/Set Position, Add Movement Input)
- Physics nodes (Set Velocity, Add Force, Collision Events)
- Input nodes (Get Input Action Value, Is Pressed/Held)
- Audio nodes (Play Sound, Stop Sound)
- UI nodes (Set UI Text, Show/Hide Widget)
- Animation nodes (Play Animation, Set Speed)
- Extensible system for adding more engine nodes

### Phase 9 - Animation + UI Runtime
- Sprite animations
- Animator component
- UI widgets

### Phase 10 - Editor Website UI
- Simple beginner-friendly interface
- Node palette
- Blueprint canvas
- Viewport
- Inspector
- Asset panel

## Testing Philosophy

- **Backend First**: All engine subsystems must pass tests before UI is built
- **Deterministic**: Engine must be step-driven for reproducible tests
- **Test Heavy**: Every subsystem has unit and integration tests
- **No Eval**: No executing user JavaScript strings

## License

MIT
