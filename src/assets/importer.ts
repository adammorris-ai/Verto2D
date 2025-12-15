/**
 * Asset importer - handles file loading and type detection
 */

import { AssetType, AssetGUID, generateGUID, detectAssetType, AssetMetadata } from './types';
import { AssetDB } from './assetDB';

export interface ImportedFile {
  file: File;
  guid: AssetGUID;
  type: AssetType;
  data: ArrayBuffer | string | null;
}

export class AssetImporter {
  private db: AssetDB;

  constructor(db: AssetDB) {
    this.db = db;
  }

  /**
   * Import a file
   */
  async importFile(file: File): Promise<ImportedFile> {
    const guid = generateGUID();
    const type = detectAssetType(file.name, file.type);

    let data: ArrayBuffer | string | null = null;

    // Read file based on type
    if (type === AssetType.Texture || type === AssetType.AudioClip || type === AssetType.Font) {
      data = await file.arrayBuffer();
    } else if (type === AssetType.Unknown && file.name.endsWith('.json')) {
      // Read JSON as text
      if (typeof file.text === 'function') {
        data = await file.text();
      } else {
        // Fallback for test environments
        const buffer = await file.arrayBuffer();
        data = new TextDecoder().decode(buffer);
      }
    }

    return {
      file,
      guid,
      type,
      data,
    };
  }

  /**
   * Import multiple files
   */
  async importFiles(files: File[]): Promise<ImportedFile[]> {
    const results = await Promise.all(files.map(file => this.importFile(file)));
    return results;
  }

  /**
   * Detect type from file content (for JSON files)
   */
  async detectTypeFromContent(file: File, data: string): Promise<AssetType> {
    if (!file.name.endsWith('.json')) {
      return detectAssetType(file.name, file.type);
    }

    try {
      const json = JSON.parse(data);
      
      // Check for prefab structure
      if (json.components && Array.isArray(json.components)) {
        return AssetType.Prefab;
      }

      // Check for scene structure
      if (json.metadata && json.entities !== undefined) {
        return AssetType.Scene;
      }

      // Check for sprite sheet structure
      if (json.textureGuid && json.frames && Array.isArray(json.frames)) {
        return AssetType.SpriteSheet;
      }

      return AssetType.Unknown;
    } catch {
      return AssetType.Unknown;
    }
  }

  /**
   * Create asset metadata from imported file
   */
  createMetadata(
    imported: ImportedFile,
    additionalData: Partial<AssetMetadata> = {}
  ): AssetMetadata {
    return {
      guid: imported.guid,
      type: imported.type,
      name: imported.file.name,
      path: imported.file.name,
      size: imported.file.size,
      importedAt: Date.now(),
      ...additionalData,
    };
  }
}
