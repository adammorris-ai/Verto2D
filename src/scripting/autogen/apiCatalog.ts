/**
 * API Catalog - describes engine functions for auto node generation
 */

import { PinType } from '../graph/pinTypes';
import { NodeCategory } from '../graph/nodeRegistry';

export interface APIParameter {
  name: string;
  type: PinType;
  defaultValue?: unknown;
  required?: boolean;
}

export interface APIFunction {
  name: string;
  displayName: string;
  category: NodeCategory;
  description?: string;
  parameters: APIParameter[];
  returnType?: PinType;
  pure?: boolean; // Pure functions have no side effects
  latent?: boolean; // Latent functions can yield/resume
  execInput?: boolean; // Has exec input pin
  execOutput?: boolean; // Has exec output pin
}

export class APICatalog {
  private functions = new Map<string, APIFunction>();

  /**
   * Register an API function
   */
  register(func: APIFunction): void {
    this.functions.set(func.name, func);
  }

  /**
   * Get API function
   */
  get(name: string): APIFunction | undefined {
    return this.functions.get(name);
  }

  /**
   * Get all functions
   */
  getAll(): APIFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get functions by category
   */
  getByCategory(category: NodeCategory): APIFunction[] {
    return Array.from(this.functions.values()).filter(f => f.category === category);
  }

  /**
   * Search functions
   */
  search(query: string): APIFunction[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.functions.values()).filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.displayName.toLowerCase().includes(lowerQuery) ||
      f.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear catalog
   */
  clear(): void {
    this.functions.clear();
  }
}
