import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { AssetDB } from '../assets/assetDB';
import { AssetImporter } from '../assets/importer';
import { AssetPipeline } from '../assets/pipeline';
import { AssetLoader } from '../assets/loaders';
import {
  AssetType,
  detectAssetType,
  generateGUID,
  TextureAsset,
  AudioClipAsset,
} from '../assets/types';
import { HeadlessRenderer } from '../render/renderer';
import { setupIndexedDBMock } from './mocks/indexedDB';
import { createMockFile } from './mocks/file';

beforeAll(() => {
  setupIndexedDBMock();
});

describe('Asset Type Detection', () => {
  it('should detect texture from extension', () => {
    expect(detectAssetType('image.png')).toBe(AssetType.Texture);
    expect(detectAssetType('sprite.jpg')).toBe(AssetType.Texture);
    expect(detectAssetType('texture.webp')).toBe(AssetType.Texture);
  });

  it('should detect audio from extension', () => {
    expect(detectAssetType('sound.mp3')).toBe(AssetType.AudioClip);
    expect(detectAssetType('music.wav')).toBe(AssetType.AudioClip);
    expect(detectAssetType('effect.ogg')).toBe(AssetType.AudioClip);
  });

  it('should detect font from extension', () => {
    expect(detectAssetType('font.ttf')).toBe(AssetType.Font);
    expect(detectAssetType('font.woff')).toBe(AssetType.Font);
  });

  it('should detect type from MIME type', () => {
    expect(detectAssetType('file', 'image/png')).toBe(AssetType.Texture);
    expect(detectAssetType('file', 'audio/mpeg')).toBe(AssetType.AudioClip);
  });

  it('should return Unknown for unrecognized types', () => {
    expect(detectAssetType('unknown.xyz')).toBe(AssetType.Unknown);
  });
});

describe('Asset GUID Generation', () => {
  it('should generate unique GUIDs', () => {
    const guid1 = generateGUID();
    const guid2 = generateGUID();
    expect(guid1).not.toBe(guid2);
  });

  it('should generate valid GUID format', () => {
    const guid = generateGUID();
    expect(typeof guid).toBe('string');
    expect(guid.length).toBeGreaterThan(0);
  });
});

describe('AssetDB', () => {
  let db: AssetDB;

  beforeEach(async () => {
    db = new AssetDB();
    await db.init();
    await db.clear();
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should store and retrieve assets', async () => {
    const asset: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'test.png',
      path: 'test.png',
      size: 1024,
      importedAt: Date.now(),
      width: 256,
      height: 256,
      format: 'png',
    };

    await db.store(asset);
    const retrieved = await db.get(asset.guid);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.guid).toBe(asset.guid);
    expect(retrieved?.name).toBe(asset.name);
  });

  it('should retrieve assets by type', async () => {
    const texture1: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'texture1.png',
      path: 'texture1.png',
      size: 1024,
      importedAt: Date.now(),
      width: 256,
      height: 256,
      format: 'png',
    };

    const texture2: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'texture2.png',
      path: 'texture2.png',
      size: 2048,
      importedAt: Date.now(),
      width: 512,
      height: 512,
      format: 'png',
    };

    const audio: AudioClipAsset = {
      guid: generateGUID(),
      type: AssetType.AudioClip,
      name: 'sound.mp3',
      path: 'sound.mp3',
      size: 4096,
      importedAt: Date.now(),
      duration: 5.0,
      sampleRate: 44100,
      channels: 2,
    };

    await db.store(texture1);
    await db.store(texture2);
    await db.store(audio);

    const textures = await db.getByType(AssetType.Texture);
    expect(textures.length).toBe(2);

    const audioClips = await db.getByType(AssetType.AudioClip);
    expect(audioClips.length).toBe(1);
  });

  it('should delete assets', async () => {
    const asset: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'test.png',
      path: 'test.png',
      size: 1024,
      importedAt: Date.now(),
      width: 256,
      height: 256,
      format: 'png',
    };

    await db.store(asset);
    expect(await db.get(asset.guid)).not.toBeNull();

    await db.delete(asset.guid);
    expect(await db.get(asset.guid)).toBeNull();
  });

  it('should clear all assets', async () => {
    const asset1: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'test1.png',
      path: 'test1.png',
      size: 1024,
      importedAt: Date.now(),
      width: 256,
      height: 256,
      format: 'png',
    };

    const asset2: TextureAsset = {
      guid: generateGUID(),
      type: AssetType.Texture,
      name: 'test2.png',
      path: 'test2.png',
      size: 2048,
      importedAt: Date.now(),
      width: 512,
      height: 512,
      format: 'png',
    };

    await db.store(asset1);
    await db.store(asset2);

    await db.clear();
    const all = await db.getAll();
    expect(all.length).toBe(0);
  });
});

describe('AssetImporter', () => {
  let db: AssetDB;
  let importer: AssetImporter;

  beforeEach(async () => {
    db = new AssetDB();
    await db.init();
    await db.clear();
    importer = new AssetImporter(db);
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should import file and detect type', async () => {
    const content = new Uint8Array([1, 2, 3]);
    const file = createMockFile(content, 'image.png', 'image/png');
    const imported = await importer.importFile(file);

    expect(imported.guid).toBeDefined();
    expect(imported.type).toBe(AssetType.Texture);
    expect(imported.file).toBe(file);
    expect(imported.data).toBeInstanceOf(ArrayBuffer);
  });

  it('should import multiple files', async () => {
    const files = [
      createMockFile(new Uint8Array([1]), 'image.png', 'image/png'),
      createMockFile(new Uint8Array([2]), 'sound.mp3', 'audio/mpeg'),
    ];

    const imported = await importer.importFiles(files);

    expect(imported.length).toBe(2);
    expect(imported[0].type).toBe(AssetType.Texture);
    expect(imported[1].type).toBe(AssetType.AudioClip);
  });

  it('should create metadata from imported file', () => {
    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.png', 'image/png');
    const imported = {
      file,
      guid: generateGUID(),
      type: AssetType.Texture,
      data: new ArrayBuffer(1024),
    };

    const metadata = importer.createMetadata(imported, { custom: 'value' });

    expect(metadata.guid).toBe(imported.guid);
    expect(metadata.type).toBe(AssetType.Texture);
    expect(metadata.name).toBe('test.png');
    expect(metadata.size).toBe(file.size);
    expect((metadata as any).custom).toBe('value');
  });

  it('should detect prefab type from JSON content', async () => {
    const prefabJson = JSON.stringify({
      components: [
        { type: 1, data: { x: 0, y: 0 } },
      ],
    });
    const file = createMockFile(prefabJson, 'prefab.json', 'application/json');
    
    const imported = await importer.importFile(file);
    const decoder = new TextDecoder();
    const textData = typeof imported.data === 'string' ? imported.data : decoder.decode(imported.data as ArrayBuffer);
    const detectedType = await importer.detectTypeFromContent(file, textData);

    expect(detectedType).toBe(AssetType.Prefab);
  });

  it('should detect scene type from JSON content', async () => {
    const sceneJson = JSON.stringify({
      metadata: { name: 'TestScene' },
      entities: [],
    });
    const file = createMockFile(sceneJson, 'scene.json', 'application/json');
    
    const imported = await importer.importFile(file);
    const decoder = new TextDecoder();
    const textData = typeof imported.data === 'string' ? imported.data : decoder.decode(imported.data as ArrayBuffer);
    const detectedType = await importer.detectTypeFromContent(file, textData);

    expect(detectedType).toBe(AssetType.Scene);
  });

  it('should detect sprite sheet type from JSON content', async () => {
    const spriteSheetJson = JSON.stringify({
      textureGuid: 'texture-123',
      frames: [
        { x: 0, y: 0, width: 32, height: 32 },
      ],
    });
    const file = createMockFile(spriteSheetJson, 'sprites.json', 'application/json');
    
    const imported = await importer.importFile(file);
    const decoder = new TextDecoder();
    const textData = typeof imported.data === 'string' ? imported.data : decoder.decode(imported.data as ArrayBuffer);
    const detectedType = await importer.detectTypeFromContent(file, textData);

    expect(detectedType).toBe(AssetType.SpriteSheet);
  });
});

describe('AssetPipeline', () => {
  let pipeline: AssetPipeline;
  let renderer: HeadlessRenderer;

  beforeEach(() => {
    pipeline = new AssetPipeline();
    renderer = new HeadlessRenderer();
    renderer.init(document.createElement('canvas'));
    pipeline.setGLContext(renderer.getContext());
  });

  afterEach(() => {
    pipeline.clear();
  });

  it('should get texture by GUID after processing', () => {
    const guid = generateGUID();
    
    // In a real scenario, this would be processed from actual file data
    // For testing, we verify the getter methods work
    const texture = pipeline.getTexture(guid);
    expect(texture).toBeNull(); // Not processed yet
  });

  it('should get audio clip by GUID', () => {
    const guid = generateGUID();
    const audio = pipeline.getAudioClip(guid);
    expect(audio).toBeNull();
  });

  it('should get sprite sheet by GUID', () => {
    const guid = generateGUID();
    const spriteSheet = pipeline.getSpriteSheet(guid);
    expect(spriteSheet).toBeNull();
  });

  it('should clear all runtime assets', () => {
    // Pipeline should handle clear without errors
    expect(() => pipeline.clear()).not.toThrow();
  });
});

describe('AssetLoader', () => {
  let db: AssetDB;
  let pipeline: AssetPipeline;
  let loader: AssetLoader;

  beforeEach(async () => {
    db = new AssetDB();
    await db.init();
    await db.clear();
    pipeline = new AssetPipeline();
    loader = new AssetLoader(db, pipeline);
  });

  afterEach(async () => {
    await db.clear();
    pipeline.clear();
  });

  it('should check if asset is loaded', () => {
    const guid = generateGUID();
    expect(loader.isLoaded(guid)).toBe(false);
  });

  it('should check if asset is loading', () => {
    const guid = generateGUID();
    expect(loader.isLoading(guid)).toBe(false);
  });

  it('should return null for non-existent asset', async () => {
    const guid = generateGUID();
    const result = await loader.load(guid);
    expect(result).toBeNull();
  });
});

describe('Asset GUID Resolution', () => {
  let db: AssetDB;

  beforeEach(async () => {
    db = new AssetDB();
    await db.init();
    await db.clear();
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should resolve asset by GUID', async () => {
    const guid = generateGUID();
    const asset: TextureAsset = {
      guid,
      type: AssetType.Texture,
      name: 'test.png',
      path: 'test.png',
      size: 1024,
      importedAt: Date.now(),
      width: 256,
      height: 256,
      format: 'png',
    };

    await db.store(asset);
    const resolved = await db.get(guid);

    expect(resolved).not.toBeNull();
    expect(resolved?.guid).toBe(guid);
  });

  it('should return null for non-existent GUID', async () => {
    const guid = generateGUID();
    const resolved = await db.get(guid);
    expect(resolved).toBeNull();
  });
});
