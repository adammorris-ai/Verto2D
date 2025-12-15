# Verto Engine Web

A full web-based game engine with Blueprints-like node scripting system.

## Status

**Phase 0, 1, 2, 3 & 4 Complete**: Foundation, ECS core, Engine loop, Render backend, and Asset pipeline are implemented and tested.

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
- ✅ Comprehensive test suite (114 tests passing)

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

### Phase 5 - Input System
- Keyboard/Mouse/Touch
- Action bindings

### Phase 6 - Physics 2D
- Rigid bodies
- Colliders (AABB, Circle)
- Collision detection
- Simple impulse resolution

### Phase 7 - Scripting: Blueprints-like Graph Engine
- Node graph model
- Pin types (Exec, Bool, Int, Float, String, Vec2, etc.)
- Node registry
- Validator
- Compiler
- Runtime with event dispatch
- Latent actions (Delay, Timelines)
- Debugger

### Phase 8 - Engine Node Packs
- Flow nodes (Events, Sequence, Branch, Loops)
- Variable nodes
- Math/Logic nodes
- Vector nodes
- String/Array nodes
- Time nodes
- Debug nodes
- Engine/World nodes
- Auto Node Generation from API catalog

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
