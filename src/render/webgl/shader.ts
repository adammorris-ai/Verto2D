/**
 * Shader compilation and program management
 */

import { GLContext } from './glContext';

export interface ShaderSource {
  vertex: string;
  fragment: string;
}

export class Shader {
  private program: WebGLProgram | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private uniformLocations = new Map<string, WebGLUniformLocation>();
  private attributeLocations = new Map<string, number>();

  /**
   * Compile shader from source
   */
  compile(context: GLContext, source: ShaderSource): boolean {
    const gl = context.getGL();
    if (!gl) {
      console.error('No WebGL2 context available');
      return false;
    }

    this.gl = gl;

    // Compile vertex shader
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, source.vertex);
    if (!vertexShader) {
      return false;
    }

    // Compile fragment shader
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, source.fragment);
    if (!fragmentShader) {
      gl.deleteShader(vertexShader);
      return false;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return false;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check linking
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      console.error('Shader program linking error:', info);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return false;
    }

    // Cleanup shaders (no longer needed after linking)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    this.program = program;
    this.cacheLocations();
    return true;
  }

  /**
   * Compile individual shader
   */
  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      console.error(`Shader compilation error (${type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment'}):`, info);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Cache uniform and attribute locations
   */
  private cacheLocations(): void {
    if (!this.gl || !this.program) return;

    // Get uniform count
    const uniformCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const info = this.gl.getActiveUniform(this.program, i);
      if (info) {
        const location = this.gl.getUniformLocation(this.program, info.name);
        if (location) {
          this.uniformLocations.set(info.name, location);
        }
      }
    }

    // Get attribute count
    const attribCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attribCount; i++) {
      const info = this.gl.getActiveAttrib(this.program, i);
      if (info) {
        const location = this.gl.getAttribLocation(this.program, info.name);
        this.attributeLocations.set(info.name, location);
      }
    }
  }

  /**
   * Use this shader program
   */
  use(): void {
    if (!this.gl || !this.program) return;
    this.gl.useProgram(this.program);
  }

  /**
   * Set uniform values
   */
  setUniform1f(name: string, value: number): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniform1f(location, value);
    }
  }

  setUniform2f(name: string, x: number, y: number): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniform2f(location, x, y);
    }
  }

  setUniform3f(name: string, x: number, y: number, z: number): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniform3f(location, x, y, z);
    }
  }

  setUniform4f(name: string, x: number, y: number, z: number, w: number): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniform4f(location, x, y, z, w);
    }
  }

  setUniformMatrix4fv(name: string, value: Float32Array): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniformMatrix4fv(location, false, value);
    }
  }

  setUniform1i(name: string, value: number): void {
    const location = this.uniformLocations.get(name);
    if (location && this.gl) {
      this.gl.uniform1i(location, value);
    }
  }

  /**
   * Get attribute location
   */
  getAttributeLocation(name: string): number {
    return this.attributeLocations.get(name) ?? -1;
  }

  /**
   * Get program
   */
  getProgram(): WebGLProgram | null {
    return this.program;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    this.uniformLocations.clear();
    this.attributeLocations.clear();
  }
}
