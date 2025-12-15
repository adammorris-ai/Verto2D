/**
 * Asset pipeline - converts imported assets into runtime-ready forms
 */

import {
  AssetGUID,
  AssetType,
  Asset,
  TextureAsset,
  AudioClipAsset,
  SpriteSheetAsset,
  generateGUID,
} from './types';
import { ImportedFile } from './importer';
import { Texture } from '../render/webgl/texture';
import { GLContext } from '../render/webgl/glContext';

export interface RuntimeTexture {
  guid: AssetGUID;
  texture: Texture;
  width: number;
  height: number;
}

export interface RuntimeAudioClip {
  guid: AssetGUID;
  audioBuffer: AudioBuffer | null;
  url: string; // Blob URL for audio
}

export interface RuntimeSpriteSheet {
  guid: AssetGUID;
  textureGuid: AssetGUID;
  frames: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    u1: number;
    v1: number;
    u2: number;
    v2: number;
  }>;
}

export type RuntimeAsset = RuntimeTexture | RuntimeAudioClip | RuntimeSpriteSheet;

export class AssetPipeline {
  private textures = new Map<AssetGUID, RuntimeTexture>();
  private audioClips = new Map<AssetGUID, RuntimeAudioClip>();
  private spriteSheets = new Map<AssetGUID, RuntimeSpriteSheet>();
  private glContext: GLContext | null = null;
  private audioContext: AudioContext | null = null;

  /**
   * Set WebGL context for texture processing
   */
  setGLContext(context: GLContext): void {
    this.glContext = context;
  }

  /**
   * Set AudioContext for audio processing
   */
  setAudioContext(context: AudioContext): void {
    this.audioContext = context;
  }

  /**
   * Process imported file into runtime asset
   */
  async process(imported: ImportedFile, asset: Asset): Promise<RuntimeAsset | null> {
    switch (asset.type) {
      case AssetType.Texture:
        return this.processTexture(imported, asset as TextureAsset);
      case AssetType.AudioClip:
        return this.processAudioClip(imported, asset as AudioClipAsset);
      case AssetType.SpriteSheet:
        return this.processSpriteSheet(imported, asset as SpriteSheetAsset);
      default:
        console.warn(`Unsupported asset type: ${asset.type}`);
        return null;
    }
  }

  /**
   * Process texture asset
   */
  private async processTexture(
    imported: ImportedFile,
    asset: TextureAsset
  ): Promise<RuntimeTexture | null> {
    if (!imported.data || !(imported.data instanceof ArrayBuffer)) {
      return null;
    }

    if (!this.glContext) {
      console.error('GL context not set for texture processing');
      return null;
    }

    // Create image from blob
    const blob = new Blob([imported.data], { type: imported.file.type });
    const url = URL.createObjectURL(blob);

    try {
      const image = await this.loadImage(url);
      
      // Create WebGL texture
      const texture = new Texture();
      if (!texture.createFromImage(this.glContext, image)) {
        URL.revokeObjectURL(url);
        return null;
      }

      const runtimeTexture: RuntimeTexture = {
        guid: asset.guid,
        texture,
        width: image.width,
        height: image.height,
      };

      this.textures.set(asset.guid, runtimeTexture);
      URL.revokeObjectURL(url);
      return runtimeTexture;
    } catch (error) {
      console.error('Failed to process texture:', error);
      URL.revokeObjectURL(url);
      return null;
    }
  }

  /**
   * Process audio clip asset
   */
  private async processAudioClip(
    imported: ImportedFile,
    asset: AudioClipAsset
  ): Promise<RuntimeAudioClip | null> {
    if (!imported.data || !(imported.data instanceof ArrayBuffer)) {
      return null;
    }

    if (!this.audioContext) {
      console.error('AudioContext not set for audio processing');
      return null;
    }

    try {
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(imported.data.slice(0));

      // Create blob URL for audio playback
      const blob = new Blob([imported.data], { type: imported.file.type });
      const url = URL.createObjectURL(blob);

      const runtimeAudio: RuntimeAudioClip = {
        guid: asset.guid,
        audioBuffer,
        url,
      };

      this.audioClips.set(asset.guid, runtimeAudio);
      return runtimeAudio;
    } catch (error) {
      console.error('Failed to process audio clip:', error);
      return null;
    }
  }

  /**
   * Process sprite sheet asset
   */
  private async processSpriteSheet(
    imported: ImportedFile,
    asset: SpriteSheetAsset
  ): Promise<RuntimeSpriteSheet | null> {
    if (!imported.data || typeof imported.data !== 'string') {
      return null;
    }

    try {
      const json = JSON.parse(imported.data);
      
      // Get texture reference
      const textureGuid = asset.textureGuid || json.textureGuid;
      if (!textureGuid) {
        console.error('SpriteSheet missing textureGuid');
        return null;
      }

      // Process frames
      const frames = (json.frames || asset.frames || []).map((frame: any) => {
        const width = frame.width || asset.frameWidth || 32;
        const height = frame.height || asset.frameHeight || 32;
        
        // Get texture dimensions (would need to look up texture)
        const textureWidth = 256; // Default, should be looked up
        const textureHeight = 256;

        return {
          x: frame.x || 0,
          y: frame.y || 0,
          width,
          height,
          u1: (frame.x || 0) / textureWidth,
          v1: (frame.y || 0) / textureHeight,
          u2: ((frame.x || 0) + width) / textureWidth,
          v2: ((frame.y || 0) + height) / textureHeight,
        };
      });

      const runtimeSpriteSheet: RuntimeSpriteSheet = {
        guid: asset.guid,
        textureGuid,
        frames,
      };

      this.spriteSheets.set(asset.guid, runtimeSpriteSheet);
      return runtimeSpriteSheet;
    } catch (error) {
      console.error('Failed to process sprite sheet:', error);
      return null;
    }
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Get runtime texture by GUID
   */
  getTexture(guid: AssetGUID): RuntimeTexture | null {
    return this.textures.get(guid) || null;
  }

  /**
   * Get runtime audio clip by GUID
   */
  getAudioClip(guid: AssetGUID): RuntimeAudioClip | null {
    return this.audioClips.get(guid) || null;
  }

  /**
   * Get runtime sprite sheet by GUID
   */
  getSpriteSheet(guid: AssetGUID): RuntimeSpriteSheet | null {
    return this.spriteSheets.get(guid) || null;
  }

  /**
   * Clear all runtime assets
   */
  clear(): void {
    // Dispose textures
    for (const texture of this.textures.values()) {
      texture.texture.dispose();
    }

    // Revoke audio URLs
    for (const audio of this.audioClips.values()) {
      URL.revokeObjectURL(audio.url);
    }

    this.textures.clear();
    this.audioClips.clear();
    this.spriteSheets.clear();
  }
}
