/**
 * UI Layout system
 */

import { Vec2 } from '../core/math/vec2';
import { UIWidget } from './widgets';

export enum LayoutMode {
  Absolute = 'absolute',
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Grid = 'grid',
}

export interface LayoutConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  padding?: { left: number; right: number; top: number; bottom: number };
  margin?: { left: number; right: number; top: number; bottom: number };
}

export class LayoutManager {
  /**
   * Calculate widget layout
   */
  calculateLayout(
    widget: UIWidget,
    _parentSize: Vec2,
    parentPosition: Vec2 = Vec2.zero()
  ): void {
    // Simple absolute layout for now
    // In a full implementation, would handle different layout modes
    
    // Apply constraints if needed
    const constraints = widget.data.constraints as LayoutConstraints | undefined;
    if (constraints) {
      if (constraints.minWidth && widget.size.x < constraints.minWidth) {
        widget.size.x = constraints.minWidth;
      }
      if (constraints.maxWidth && widget.size.x > constraints.maxWidth) {
        widget.size.x = constraints.maxWidth;
      }
      if (constraints.minHeight && widget.size.y < constraints.minHeight) {
        widget.size.y = constraints.minHeight;
      }
      if (constraints.maxHeight && widget.size.y > constraints.maxHeight) {
        widget.size.y = constraints.maxHeight;
      }
    }

    // Position relative to parent
    widget.position.x = parentPosition.x + widget.position.x;
    widget.position.y = parentPosition.y + widget.position.y;
  }

  /**
   * Layout children widgets
   */
  layoutChildren(
    parent: UIWidget,
    children: UIWidget[]
  ): void {
    // Simple vertical layout for children
    let currentY = parent.position.y;
    const spacing = 5;

    for (const child of children) {
      child.position.y = currentY;
      child.position.x = parent.position.x;
      currentY += child.size.y + spacing;
    }
  }
}
