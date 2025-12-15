/**
 * Async asset loaders
 */

import { AssetGUID } from './types';
import { AssetDB } from './assetDB';
import { AssetPipeline, RuntimeAsset } from './pipeline';

export class AssetLoader {
  private db: AssetDB;
  private pipeline: AssetPipeline;
  private loadingPromises = new Map<AssetGUID, Promise<RuntimeAsset | null>>();

  constructor(db: AssetDB, pipeline: AssetPipeline) {
    this.db = db;
    this.pipeline = pipeline;
  }

  /**
   * Load asset by GUID
   */
  async load(guid: AssetGUID): Promise<RuntimeAsset | null> {
    // Check if already loading
    const existingPromise = this.loadingPromises.get(guid);
    if (existingPromise) {
      return existingPromise;
    }

    // Check if already loaded
    const runtimeAsset = this.getRuntimeAsset(guid);
    if (runtimeAsset) {
      return runtimeAsset;
    }

    // Start loading
    const promise = this.loadAsset(guid);
    this.loadingPromises.set(guid, promise);

    try {
      const result = await promise;
      this.loadingPromises.delete(guid);
      return result;
    } catch (error) {
      this.loadingPromises.delete(guid);
      throw error;
    }
  }

  /**
   * Load multiple assets
   */
  async loadAll(guids: AssetGUID[]): Promise<(RuntimeAsset | null)[]> {
    return Promise.all(guids.map(guid => this.load(guid)));
  }

  /**
   * Internal asset loading
   */
  private async loadAsset(guid: AssetGUID): Promise<RuntimeAsset | null> {
    // Get asset metadata from DB
    const asset = await this.db.get(guid);
    if (!asset) {
      console.error(`Asset not found: ${guid}`);
      return null;
    }

    // For now, we need the file data to process
    // In a real implementation, we'd store the file data in IndexedDB too
    // For this MVP, we'll assume assets are already processed
    // This would need to be enhanced to actually load file data from DB

    return null;
  }

  /**
   * Get runtime asset if already loaded
   */
  private getRuntimeAsset(guid: AssetGUID): RuntimeAsset | null {
    return (
      this.pipeline.getTexture(guid) ||
      this.pipeline.getAudioClip(guid) ||
      this.pipeline.getSpriteSheet(guid) ||
      null
    );
  }

  /**
   * Check if asset is loaded
   */
  isLoaded(guid: AssetGUID): boolean {
    return this.getRuntimeAsset(guid) !== null;
  }

  /**
   * Check if asset is loading
   */
  isLoading(guid: AssetGUID): boolean {
    return this.loadingPromises.has(guid);
  }
}
