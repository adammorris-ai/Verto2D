/**
 * Material system for rendering
 */

import { Shader } from './webgl/shader';
import { Texture } from './webgl/texture';
import { Color } from '../core/math/color';

export interface MaterialProperties {
  shader: Shader;
  texture?: Texture;
  color?: Color;
  [key: string]: unknown;
}

export class Material {
  private shader: Shader;
  private texture: Texture | null = null;
  private color: Color = Color.white();
  private properties: Record<string, unknown> = {};

  constructor(shader: Shader, properties: Partial<MaterialProperties> = {}) {
    this.shader = shader;
    if (properties.texture) {
      this.texture = properties.texture;
    }
    if (properties.color) {
      this.color = properties.color.clone();
    }
    if (properties) {
      Object.assign(this.properties, properties);
    }
  }

  /**
   * Use this material for rendering
   */
  use(): void {
    this.shader.use();
    
    if (this.texture) {
      this.texture.bind(0);
      this.shader.setUniform1i('u_texture', 0);
    }

    this.shader.setUniform4f(
      'u_color',
      this.color.r,
      this.color.g,
      this.color.b,
      this.color.a
    );
  }

  /**
   * Get shader
   */
  getShader(): Shader {
    return this.shader;
  }

  /**
   * Get texture
   */
  getTexture(): Texture | null {
    return this.texture;
  }

  /**
   * Set texture
   */
  setTexture(texture: Texture | null): void {
    this.texture = texture;
  }

  /**
   * Get color
   */
  getColor(): Color {
    return this.color.clone();
  }

  /**
   * Set color
   */
  setColor(color: Color): void {
    this.color = color.clone();
  }

  /**
   * Set property
   */
  setProperty(key: string, value: unknown): void {
    this.properties[key] = value;
  }

  /**
   * Get property
   */
  getProperty(key: string): unknown {
    return this.properties[key];
  }
}
