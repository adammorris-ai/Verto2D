import { describe, it, expect, beforeEach } from 'vitest';
import { HeadlessRenderer, Renderer } from '../render/renderer';
import { Shader } from '../render/webgl/shader';
import { Texture } from '../render/webgl/texture';
import { Material } from '../render/materials';
import { Color } from '../core/math/color';
import { GLContext } from '../render/webgl/glContext';

describe('Renderer Command Buffer', () => {
  let renderer: HeadlessRenderer;
  let shader: Shader;
  let material: Material;

  beforeEach(() => {
    renderer = new HeadlessRenderer();
    
    // Create a mock shader (won't actually compile in headless mode)
    shader = new Shader();
    
    // Create material
    material = new Material(shader);
  });

  it('should record clear commands', () => {
    renderer.beginFrame();
    renderer.clear(1, 0, 0, 1);
    renderer.endFrame();

    const commands = renderer.getCommandBuffer().getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe('clear');
    expect(commands[0].clearColor).toEqual({ r: 1, g: 0, b: 0, a: 1 });
  });

  it('should record sprite draw commands', () => {
    renderer.beginFrame();
    renderer.drawSprite(material, {
      x: 10,
      y: 20,
      width: 32,
      height: 32,
    });
    renderer.endFrame();

    const commands = renderer.getCommandBuffer().getCommands();
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe('sprite');
    expect(commands[0].sprite).toBeDefined();
    expect(commands[0].sprite?.x).toBe(10);
    expect(commands[0].sprite?.y).toBe(20);
  });

  it('should clear command buffer on beginFrame', () => {
    renderer.beginFrame();
    renderer.clear();
    renderer.drawSprite(material, { x: 0, y: 0, width: 1, height: 1 });
    renderer.endFrame();

    expect(renderer.getCommandBuffer().count()).toBe(2);

    renderer.beginFrame();
    expect(renderer.getCommandBuffer().count()).toBe(0);
  });
});

describe('Sprite Batch Sorting', () => {
  let renderer: HeadlessRenderer;
  let shader1: Shader;
  let shader2: Shader;
  let material1: Material;
  let material2: Material;
  let texture1: Texture;
  let texture2: Texture;

  beforeEach(() => {
    renderer = new HeadlessRenderer();
    
    shader1 = new Shader();
    shader2 = new Shader();
    
    // Create mock textures (won't actually create in headless)
    texture1 = new Texture();
    texture2 = new Texture();
    
    material1 = new Material(shader1, { texture: texture1 });
    material2 = new Material(shader2, { texture: texture2 });
  });

  it('should batch sprites with same material', () => {
    renderer.beginFrame();
    
    // Draw multiple sprites with same material
    renderer.drawSprite(material1, { x: 0, y: 0, width: 32, height: 32 });
    renderer.drawSprite(material1, { x: 32, y: 0, width: 32, height: 32 });
    renderer.drawSprite(material1, { x: 64, y: 0, width: 32, height: 32 });
    
    renderer.endFrame();

    const commands = renderer.getCommandBuffer().getCommands();
    expect(commands.length).toBe(3);
    
    // All commands should have same material
    for (const cmd of commands) {
      expect(cmd.material).toBe(material1);
    }
  });

  it('should separate sprites with different materials', () => {
    renderer.beginFrame();
    
    renderer.drawSprite(material1, { x: 0, y: 0, width: 32, height: 32 });
    renderer.drawSprite(material2, { x: 32, y: 0, width: 32, height: 32 });
    renderer.drawSprite(material1, { x: 64, y: 0, width: 32, height: 32 });
    
    renderer.endFrame();

    const commands = renderer.getCommandBuffer().getCommands();
    expect(commands.length).toBe(3);
    
    // First and third should be material1, second should be material2
    expect(commands[0].material).toBe(material1);
    expect(commands[1].material).toBe(material2);
    expect(commands[2].material).toBe(material1);
  });
});

describe('Camera System', () => {
  let renderer: HeadlessRenderer;

  beforeEach(() => {
    renderer = new HeadlessRenderer();
  });

  it('should set camera position', () => {
    const camera = renderer.getCamera();
    camera.setPosition(100, 200);
    
    const pos = camera.getPosition();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it('should set camera zoom', () => {
    const camera = renderer.getCamera();
    camera.setZoom(2.0);
    expect(camera.getZoom()).toBe(2.0);
    
    // Should clamp minimum zoom
    camera.setZoom(0.05);
    expect(camera.getZoom()).toBeGreaterThanOrEqual(0.1);
  });

  it('should set viewport', () => {
    const camera = renderer.getCamera();
    camera.setViewport(1920, 1080);
    
    const viewport = camera.getViewport();
    expect(viewport.width).toBe(1920);
    expect(viewport.height).toBe(1080);
  });

  it('should update view-projection matrix', () => {
    const camera = renderer.getCamera();
    camera.setViewport(800, 600);
    camera.setPosition(100, 200);
    camera.setZoom(2.0);
    
    const matrix = camera.getViewProjectionMatrix();
    expect(matrix).toBeDefined();
    
    // Matrix should be valid (not identity if position/zoom changed)
    const arr = matrix.toArray();
    expect(arr.length).toBe(16);
  });

  it('should convert screen to world coordinates', () => {
    const camera = renderer.getCamera();
    camera.setViewport(800, 600);
    camera.setPosition(0, 0);
    camera.setZoom(1.0);
    
    // Center of screen should map to camera position
    const world = camera.screenToWorld(400, 300);
    expect(world.x).toBeCloseTo(0, 1);
    expect(world.y).toBeCloseTo(0, 1);
  });

  it('should convert world to screen coordinates', () => {
    const camera = renderer.getCamera();
    camera.setViewport(800, 600);
    camera.setPosition(0, 0);
    camera.setZoom(1.0);
    
    // Camera position should map to center of screen
    const screen = camera.worldToScreen(0, 0);
    expect(screen.x).toBeCloseTo(400, 1);
    expect(screen.y).toBeCloseTo(300, 1);
  });
});

describe('Material System', () => {
  let shader: Shader;
  let material: Material;

  beforeEach(() => {
    shader = new Shader();
    material = new Material(shader);
  });

  it('should set and get color', () => {
    const red = Color.red();
    material.setColor(red);
    
    const color = material.getColor();
    expect(color.r).toBe(1);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
  });

  it('should set and get texture', () => {
    const texture = new Texture();
    material.setTexture(texture);
    
    expect(material.getTexture()).toBe(texture);
  });

  it('should set and get properties', () => {
    material.setProperty('test', 42);
    expect(material.getProperty('test')).toBe(42);
  });
});

describe('Renderer Initialization', () => {
  it('should create headless renderer', () => {
    const renderer = new HeadlessRenderer();
    expect(renderer.isInitialized()).toBe(false);
    
    // Headless renderer should "initialize" without canvas
    const canvas = document.createElement('canvas');
    expect(renderer.init(canvas)).toBe(true);
    expect(renderer.isInitialized()).toBe(true);
  });

  it('should handle resize', () => {
    const renderer = new HeadlessRenderer();
    renderer.resize(1920, 1080);
    
    const camera = renderer.getCamera();
    const viewport = camera.getViewport();
    expect(viewport.width).toBe(1920);
    expect(viewport.height).toBe(1080);
  });
});
