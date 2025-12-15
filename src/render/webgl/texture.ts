/**
 * Texture management
 */

import { GLContext } from './glContext';

export class Texture {
  private texture: WebGLTexture | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private width = 0;
  private height = 0;

  /**
   * Create texture from image
   */
  createFromImage(context: GLContext, image: HTMLImageElement | ImageBitmap): boolean {
    const gl = context.getGL();
    if (!gl) {
      console.error('No WebGL2 context available');
      return false;
    }

    this.gl = gl;
    this.width = image.width;
    this.height = image.height;

    const texture = gl.createTexture();
    if (!texture) {
      console.error('Failed to create texture');
      return false;
    }

    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload image data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return true;
  }

  /**
   * Create empty texture
   */
  createEmpty(context: GLContext, width: number, height: number): boolean {
    const gl = context.getGL();
    if (!gl) {
      console.error('No WebGL2 context available');
      return false;
    }

    this.gl = gl;
    this.width = width;
    this.height = height;

    const texture = gl.createTexture();
    if (!texture) {
      console.error('Failed to create texture');
      return false;
    }

    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Create empty texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return true;
  }

  /**
   * Bind texture to texture unit
   */
  bind(unit: number = 0): void {
    if (!this.gl || !this.texture) return;

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  /**
   * Unbind texture
   */
  unbind(): void {
    if (!this.gl) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  /**
   * Get texture width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get texture height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Get WebGL texture
   */
  getTexture(): WebGLTexture | null {
    return this.texture;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.gl && this.texture) {
      this.gl.deleteTexture(this.texture);
      this.texture = null;
    }
  }
}
