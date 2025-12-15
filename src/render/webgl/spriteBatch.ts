/**
 * Sprite batch renderer for efficient 2D rendering
 */

import { GLContext } from './glContext';
import { Material } from '../materials';
import { Mat4 } from '../../core/math/mat4';
import { Color } from '../../core/math/color';
import { Mesh } from './mesh';

export interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  u1?: number; // UV coordinates (defaults to full texture)
  v1?: number;
  u2?: number;
  v2?: number;
  color?: Color;
}

export interface DrawCall {
  material: Material;
  sprites: Sprite[];
}

export class SpriteBatch {
  private gl: WebGL2RenderingContext | null = null;
  private quadMesh: Mesh | null = null;
  private drawCalls: DrawCall[] = [];
  private currentMaterial: Material | null = null;
  private currentSprites: Sprite[] = [];

  /**
   * Initialize sprite batch
   */
  init(context: GLContext, quadMesh: import('./mesh').Mesh): void {
    const gl = context.getGL();
    if (!gl) {
      console.error('No WebGL2 context available');
      return;
    }

    this.gl = gl;
    this.quadMesh = quadMesh;
  }

  /**
   * Begin batch
   */
  begin(): void {
    this.drawCalls = [];
    this.currentMaterial = null;
    this.currentSprites = [];
  }

  /**
   * Draw a sprite
   */
  draw(material: Material, sprite: Sprite): void {
    // If material changed, flush current batch
    if (this.currentMaterial !== material) {
      this.flush();
      this.currentMaterial = material;
      this.currentSprites = [];
    }

    this.currentSprites.push({
      x: sprite.x,
      y: sprite.y,
      width: sprite.width,
      height: sprite.height,
      rotation: sprite.rotation ?? 0,
      u1: sprite.u1 ?? 0,
      v1: sprite.v1 ?? 0,
      u2: sprite.u2 ?? 1,
      v2: sprite.v2 ?? 1,
      color: sprite.color ?? Color.white(),
    });
  }

  /**
   * Flush current batch
   */
  flush(): void {
    if (!this.currentMaterial || this.currentSprites.length === 0) {
      return;
    }

    this.drawCalls.push({
      material: this.currentMaterial,
      sprites: [...this.currentSprites],
    });

    this.currentSprites = [];
  }

  /**
   * End batch and get draw calls (sorted by material/texture)
   */
  end(): DrawCall[] {
    this.flush();

    // Sort draw calls by material (for batching optimization)
    const sorted = [...this.drawCalls].sort((a, b) => {
      const aTex = a.material.getTexture();
      const bTex = b.material.getTexture();
      
      if (aTex && bTex) {
        return aTex.getTexture() === bTex.getTexture() ? 0 : 1;
      }
      return a.material.getShader().getProgram() === b.material.getShader().getProgram() ? 0 : 1;
    });

    this.drawCalls = [];
    return sorted;
  }

  /**
   * Render a single sprite (immediate mode)
   */
  renderSprite(
    material: Material,
    sprite: Sprite,
    viewProjection: Mat4
  ): void {
    if (!this.gl || !this.quadMesh) return;

    material.use();
    material.getShader().setUniformMatrix4fv('u_viewProjection', viewProjection.toArray());

    // Set sprite transform
    const transform = Mat4.identity();
    transform.translate(sprite.x, sprite.y, 0);
    if (sprite.rotation) {
      transform.rotateZ(sprite.rotation);
    }
    transform.scale(sprite.width * 0.5, sprite.height * 0.5, 1);
    
    material.getShader().setUniformMatrix4fv('u_transform', transform.toArray());

    // Set UV coordinates
    material.getShader().setUniform4f(
      'u_uvRect',
      sprite.u1 ?? 0,
      sprite.v1 ?? 0,
      sprite.u2 ?? 1,
      sprite.v2 ?? 1
    );

    // Set color tint
    const color = sprite.color ?? Color.white();
    material.getShader().setUniform4f('u_tint', color.r, color.g, color.b, color.a);

    // Setup quad mesh attributes
    const shader = material.getShader();
    this.quadMesh.setupAttributes(
      shader.getAttributeLocation('a_position'),
      shader.getAttributeLocation('a_uv'),
      shader.getAttributeLocation('a_color')
    );

    this.quadMesh.draw();
  }
}
