/**
 * Main renderer - orchestrates all rendering subsystems
 */

import { GLContext } from './webgl/glContext';
import { Camera } from './camera';
import { SpriteBatch, DrawCall } from './webgl/spriteBatch';
import { Mesh } from './webgl/mesh';
import { Material } from './materials';
import { Sprite } from './webgl/spriteBatch';

export interface RenderCommand {
  type: 'clear' | 'sprite' | 'custom';
  material?: Material;
  sprite?: Sprite;
  clearColor?: { r: number; g: number; b: number; a: number };
  [key: string]: unknown;
}

/**
 * Command buffer for rendering (allows headless testing)
 */
export class RenderCommandBuffer {
  private commands: RenderCommand[] = [];

  /**
   * Add a command
   */
  add(command: RenderCommand): void {
    this.commands.push(command);
  }

  /**
   * Get all commands
   */
  getCommands(): RenderCommand[] {
    return [...this.commands];
  }

  /**
   * Clear commands
   */
  clear(): void {
    this.commands = [];
  }

  /**
   * Get command count
   */
  count(): number {
    return this.commands.length;
  }
}

export class Renderer {
  private context: GLContext;
  private camera: Camera;
  private spriteBatch: SpriteBatch;
  private quadMesh: Mesh | null = null;
  private commandBuffer: RenderCommandBuffer;
  private initialized = false;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.context = new GLContext();
    this.camera = new Camera();
    this.spriteBatch = new SpriteBatch();
    this.commandBuffer = new RenderCommandBuffer();

    if (canvas) {
      this.init(canvas);
    }
  }

  /**
   * Initialize renderer with canvas
   */
  init(canvas: HTMLCanvasElement): boolean {
    if (!this.context.init(canvas)) {
      return false;
    }

    // Create quad mesh for sprite rendering
    this.quadMesh = new Mesh();
    const quadData: import('./webgl/mesh').VertexData = {
      positions: new Float32Array([
        -1, -1, // Bottom-left
         1, -1, // Bottom-right
         1,  1, // Top-right
        -1,  1, // Top-left
      ]),
      uvs: new Float32Array([
        0, 0, // Bottom-left
        1, 0, // Bottom-right
        1, 1, // Top-right
        0, 1, // Top-left
      ]),
      indices: new Uint16Array([
        0, 1, 2,
        0, 2, 3,
      ]),
    };

    if (!this.quadMesh.create(this.context, quadData)) {
      return false;
    }

    this.spriteBatch.init(this.context, this.quadMesh);

    // Set camera viewport
    const viewport = this.context.getViewport();
    this.camera.setViewport(viewport.width, viewport.height);

    this.initialized = true;
    return true;
  }

  /**
   * Resize renderer
   */
  resize(width: number, height: number): void {
    this.context.resize(width, height);
    this.camera.setViewport(width, height);
  }

  /**
   * Get camera
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * Get command buffer (for testing)
   */
  getCommandBuffer(): RenderCommandBuffer {
    return this.commandBuffer;
  }

  /**
   * Begin frame
   */
  beginFrame(): void {
    this.commandBuffer.clear();
    this.spriteBatch.begin();
  }

  /**
   * Clear screen
   */
  clear(r = 0, g = 0, b = 0, a = 1): void {
    this.commandBuffer.add({
      type: 'clear',
      clearColor: { r, g, b, a },
    });

    if (this.initialized) {
      const gl = this.context.getGL();
      if (gl) {
        gl.clearColor(r, g, b, a);
        this.context.clear();
      }
    }
  }

  /**
   * Draw sprite
   */
  drawSprite(material: Material, sprite: Sprite): void {
    this.commandBuffer.add({
      type: 'sprite',
      material,
      sprite,
    });

    if (this.initialized && this.quadMesh) {
      this.spriteBatch.draw(material, sprite);
    }
  }

  /**
   * End frame and render
   */
  endFrame(): void {
    if (!this.initialized) {
      return;
    }

    // Flush sprite batch and get draw calls
    const drawCalls = this.spriteBatch.end();

    // Render all draw calls
    const viewProjection = this.camera.getViewProjectionMatrix();
    
    for (const call of drawCalls) {
      for (const sprite of call.sprites) {
        this.spriteBatch.renderSprite(call.material, sprite, viewProjection);
      }
    }
  }

  /**
   * Check if renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get GL context
   */
  getContext(): GLContext {
    return this.context;
  }
}

/**
 * Headless renderer for testing (no actual GPU)
 */
export class HeadlessRenderer extends Renderer {
  constructor() {
    super(null);
  }

  override init(_canvas: HTMLCanvasElement): boolean {
    // Headless renderer doesn't need actual canvas
    // Set initialized flag directly
    (this as any).initialized = true;
    return true;
  }

  override clear(r = 0, g = 0, b = 0, a = 1): void {
    // Just record command, don't actually clear
    this.getCommandBuffer().add({
      type: 'clear',
      clearColor: { r, g, b, a },
    });
  }

  override drawSprite(material: Material, sprite: Sprite): void {
    // Just record command, don't actually render
    this.getCommandBuffer().add({
      type: 'sprite',
      material,
      sprite,
    });
  }

  override endFrame(): void {
    // Headless renderer doesn't actually render
    // Commands are stored in command buffer for verification
  }
}
