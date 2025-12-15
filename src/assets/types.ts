/**
 * Asset type definitions and GUID system
 */

export type AssetGUID = string;

export enum AssetType {
  Texture = 'texture',
  AudioClip = 'audio',
  Mesh = 'mesh',
  SpriteSheet = 'spritesheet',
  Font = 'font',
  Prefab = 'prefab',
  Scene = 'scene',
  Unknown = 'unknown',
}

export interface AssetMetadata {
  guid: AssetGUID;
  type: AssetType;
  name: string;
  path: string;
  size: number;
  importedAt: number;
  [key: string]: unknown;
}

export interface TextureAsset extends AssetMetadata {
  type: AssetType.Texture;
  width: number;
  height: number;
  format: string;
}

export interface AudioClipAsset extends AssetMetadata {
  type: AssetType.AudioClip;
  duration: number;
  sampleRate: number;
  channels: number;
}

export interface SpriteSheetAsset extends AssetMetadata {
  type: AssetType.SpriteSheet;
  textureGuid: AssetGUID;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frames: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface MeshAsset extends AssetMetadata {
  type: AssetType.Mesh;
  vertexCount: number;
  indexCount: number;
}

export interface FontAsset extends AssetMetadata {
  type: AssetType.Font;
  fontSize: number;
  family: string;
}

export type Asset = TextureAsset | AudioClipAsset | SpriteSheetAsset | MeshAsset | FontAsset | AssetMetadata;

/**
 * Generate a GUID
 */
export function generateGUID(): AssetGUID {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Detect asset type from file
 */
export function detectAssetType(filename: string, mimeType?: string): AssetType {
  const ext = getFileExtension(filename);

  // Image types
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
    return AssetType.Texture;
  }

  // Audio types
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) {
    return AssetType.AudioClip;
  }

  // JSON types (could be prefab, scene, spritesheet, etc.)
  if (ext === 'json') {
    // Would need to inspect content to determine exact type
    return AssetType.Unknown; // Will be determined by content inspection
  }

  // Font types
  if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
    return AssetType.Font;
  }

  // MIME type fallback
  if (mimeType) {
    if (mimeType.startsWith('image/')) {
      return AssetType.Texture;
    }
    if (mimeType.startsWith('audio/')) {
      return AssetType.AudioClip;
    }
    if (mimeType === 'application/json') {
      return AssetType.Unknown;
    }
  }

  return AssetType.Unknown;
}
