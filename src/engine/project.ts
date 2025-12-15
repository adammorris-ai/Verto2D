/**
 * Project model - contains scenes and prefabs
 */

import { Scene } from './scene';
import { PrefabRegistry } from './prefab';

export interface ProjectMetadata {
  name: string;
  version: string;
  [key: string]: unknown;
}

export class Project {
  private metadata: ProjectMetadata;
  private scenes: Scene[] = [];
  private prefabs: PrefabRegistry;

  constructor(name: string) {
    this.metadata = {
      name,
      version: '1.0.0',
    };
    this.prefabs = new PrefabRegistry();
  }

  /**
   * Get project metadata
   */
  getMetadata(): ProjectMetadata {
    return { ...this.metadata };
  }

  /**
   * Set metadata value
   */
  setMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Add a scene
   */
  addScene(scene: Scene): void {
    this.scenes.push(scene);
  }

  /**
   * Get all scenes
   */
  getScenes(): Scene[] {
    return [...this.scenes];
  }

  /**
   * Get scene by index
   */
  getScene(index: number): Scene | undefined {
    return this.scenes[index];
  }

  /**
   * Get prefab registry
   */
  getPrefabs(): PrefabRegistry {
    return this.prefabs;
  }

  /**
   * Serialize project
   */
  serialize(): unknown {
    return {
      metadata: this.metadata,
      scenes: this.scenes.map(s => s.serialize()),
      prefabs: this.prefabs.serialize(),
    };
  }

  /**
   * Deserialize project
   */
  deserialize(data: unknown): void {
    const projectData = data as {
      metadata?: ProjectMetadata;
      scenes?: unknown[];
      prefabs?: unknown;
    };

    if (projectData.metadata) {
      this.metadata = { ...this.metadata, ...projectData.metadata };
    }

    if (projectData.scenes) {
      this.scenes = projectData.scenes.map((s, i) => {
        const scene = new Scene(`Scene${i}`);
        scene.deserialize(s);
        return scene;
      });
    }

    if (projectData.prefabs) {
      this.prefabs.deserialize(projectData.prefabs);
    }
  }

  /**
   * Clear project
   */
  clear(): void {
    this.scenes.forEach(s => s.clear());
    this.scenes = [];
    this.prefabs.clear();
  }
}
