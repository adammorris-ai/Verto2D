/**
 * Mesh/Geometry management
 */

import { GLContext } from './glContext';

export interface VertexData {
  positions: Float32Array;
  uvs?: Float32Array;
  colors?: Float32Array;
  indices?: Uint16Array;
}

export class Mesh {
  private vao: WebGLVertexArrayObject | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private indexCount = 0;
  private vertexCount = 0;

  /**
   * Create mesh from vertex data
   */
  create(context: GLContext, data: VertexData): boolean {
    const gl = context.getGL();
    if (!gl) {
      console.error('No WebGL2 context available');
      return false;
    }

    this.gl = gl;

    // Create VAO
    const vao = gl.createVertexArray();
    if (!vao) {
      console.error('Failed to create VAO');
      return false;
    }
    this.vao = vao;
    gl.bindVertexArray(vao);

    // Upload positions
    this.positionBuffer = this.createBuffer(gl.ARRAY_BUFFER, data.positions);
    if (!this.positionBuffer) {
      gl.deleteVertexArray(vao);
      return false;
    }

    // Upload UVs if provided
    if (data.uvs) {
      this.uvBuffer = this.createBuffer(gl.ARRAY_BUFFER, data.uvs);
    }

    // Upload colors if provided
    if (data.colors) {
      this.colorBuffer = this.createBuffer(gl.ARRAY_BUFFER, data.colors);
    }

    // Upload indices if provided
    if (data.indices) {
      this.indexBuffer = this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, data.indices);
      this.indexCount = data.indices.length;
    }

    this.vertexCount = data.positions.length / 2; // Assuming 2D positions (x, y)

    gl.bindVertexArray(null);
    return true;
  }

  /**
   * Create and upload buffer
   */
  private createBuffer(target: number, data: ArrayBufferView): WebGLBuffer | null {
    if (!this.gl) return null;

    const buffer = this.gl.createBuffer();
    if (!buffer) return null;

    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  /**
   * Setup vertex attributes for shader
   */
  setupAttributes(
    positionLoc: number,
    uvLoc: number = -1,
    colorLoc: number = -1
  ): void {
    if (!this.gl || !this.vao) return;

    this.gl.bindVertexArray(this.vao);

    // Position attribute
    if (positionLoc >= 0 && this.positionBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
    }

    // UV attribute
    if (uvLoc >= 0 && this.uvBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
      this.gl.enableVertexAttribArray(uvLoc);
      this.gl.vertexAttribPointer(uvLoc, 2, this.gl.FLOAT, false, 0, 0);
    }

    // Color attribute
    if (colorLoc >= 0 && this.colorBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.enableVertexAttribArray(colorLoc);
      this.gl.vertexAttribPointer(colorLoc, 4, this.gl.FLOAT, false, 0, 0);
    }
  }

  /**
   * Draw the mesh
   */
  draw(): void {
    if (!this.gl || !this.vao) return;

    this.gl.bindVertexArray(this.vao);

    if (this.indexBuffer && this.indexCount > 0) {
      this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    } else {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
  }

  /**
   * Get vertex count
   */
  getVertexCount(): number {
    return this.vertexCount;
  }

  /**
   * Get index count
   */
  getIndexCount(): number {
    return this.indexCount;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (!this.gl) return;

    if (this.vao) {
      this.gl.deleteVertexArray(this.vao);
      this.vao = null;
    }
    if (this.positionBuffer) {
      this.gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }
    if (this.uvBuffer) {
      this.gl.deleteBuffer(this.uvBuffer);
      this.uvBuffer = null;
    }
    if (this.colorBuffer) {
      this.gl.deleteBuffer(this.colorBuffer);
      this.colorBuffer = null;
    }
    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = null;
    }
  }
}
