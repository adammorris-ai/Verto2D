/**
 * WebGL2 context management
 */

export class GLContext {
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Initialize WebGL2 context from canvas element
   */
  init(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    });

    if (!gl) {
      console.error('Failed to get WebGL2 context');
      return false;
    }

    this.gl = gl;
    this.setupDefaults();
    return true;
  }

  /**
   * Get WebGL2 context
   */
  getGL(): WebGL2RenderingContext | null {
    return this.gl;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Setup default GL state
   */
  private setupDefaults(): void {
    if (!this.gl) return;

    const gl = this.gl;
    
    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    // Set clear color (black)
    gl.clearColor(0, 0, 0, 1);
    
    // Set viewport
    if (this.canvas) {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Resize viewport
   */
  resize(width: number, height: number): void {
    if (!this.gl || !this.canvas) return;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  /**
   * Clear the framebuffer
   */
  clear(color: boolean = true, depth: boolean = true): void {
    if (!this.gl) return;
    
    let flags = 0;
    if (color) flags |= this.gl.COLOR_BUFFER_BIT;
    if (depth) flags |= this.gl.DEPTH_BUFFER_BIT;
    
    this.gl.clear(flags);
  }

  /**
   * Get viewport dimensions
   */
  getViewport(): { width: number; height: number } {
    if (!this.canvas) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Check if context is valid
   */
  isValid(): boolean {
    return this.gl !== null;
  }
}
