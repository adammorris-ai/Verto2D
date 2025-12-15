/**
 * Camera system for 2D rendering
 */

import { Mat4 } from '../core/math/mat4';
import { Vec2 } from '../core/math/vec2';

export class Camera {
  private position = new Vec2(0, 0);
  private zoom = 1.0;
  private viewportWidth = 800;
  private viewportHeight = 600;
  private viewMatrix = Mat4.identity();
  private projectionMatrix = Mat4.identity();
  private viewProjectionMatrix = Mat4.identity();
  private dirty = true;

  /**
   * Set camera position
   */
  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.dirty = true;
  }

  /**
   * Get camera position
   */
  getPosition(): Vec2 {
    return this.position.clone();
  }

  /**
   * Move camera
   */
  translate(dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
    this.dirty = true;
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, zoom);
    this.dirty = true;
  }

  /**
   * Get zoom level
   */
  getZoom(): number {
    return this.zoom;
  }

  /**
   * Set viewport dimensions
   */
  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.dirty = true;
  }

  /**
   * Get viewport dimensions
   */
  getViewport(): { width: number; height: number } {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  /**
   * Update matrices if dirty
   */
  update(): void {
    if (!this.dirty) return;

    // Update projection matrix (orthographic)
    const halfWidth = (this.viewportWidth / this.zoom) * 0.5;
    const halfHeight = (this.viewportHeight / this.zoom) * 0.5;
    
    this.projectionMatrix = Mat4.identity();
    this.projectionMatrix.ortho(
      -halfWidth,
      halfWidth,
      -halfHeight,
      halfHeight,
      -1,
      1
    );

    // Update view matrix (translate by negative position)
    this.viewMatrix = Mat4.identity();
    this.viewMatrix.translate(-this.position.x, -this.position.y, 0);

    // Update view-projection matrix
    this.viewProjectionMatrix = this.projectionMatrix.clone();
    this.viewProjectionMatrix.multiply(this.viewMatrix);

    this.dirty = false;
  }

  /**
   * Get view-projection matrix
   */
  getViewProjectionMatrix(): Mat4 {
    this.update();
    return this.viewProjectionMatrix.clone();
  }

  /**
   * Get view matrix
   */
  getViewMatrix(): Mat4 {
    this.update();
    return this.viewMatrix.clone();
  }

  /**
   * Get projection matrix
   */
  getProjectionMatrix(): Mat4 {
    this.update();
    return this.projectionMatrix.clone();
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): Vec2 {
    this.update();
    
    // Normalize screen coordinates to [-1, 1]
    const nx = (screenX / this.viewportWidth) * 2 - 1;
    const ny = 1 - (screenY / this.viewportHeight) * 2; // Flip Y

    // For 2D orthographic, simplified calculation
    const halfWidth = (this.viewportWidth / this.zoom) * 0.5;
    const halfHeight = (this.viewportHeight / this.zoom) * 0.5;

    return new Vec2(
      this.position.x + nx * halfWidth,
      this.position.y + ny * halfHeight
    );
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): Vec2 {
    this.update();

    const dx = worldX - this.position.x;
    const dy = worldY - this.position.y;

    const halfWidth = (this.viewportWidth / this.zoom) * 0.5;
    const halfHeight = (this.viewportHeight / this.zoom) * 0.5;

    const nx = dx / halfWidth;
    const ny = dy / halfHeight;

    return new Vec2(
      (nx + 1) * 0.5 * this.viewportWidth,
      (1 - ny) * 0.5 * this.viewportHeight // Flip Y
    );
  }
}
