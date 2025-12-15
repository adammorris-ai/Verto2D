/**
 * UI Runtime System - manages UI widgets and rendering
 */

import { UIWidget, WidgetType } from './widgets';
import { Vec2 } from '../core/math/vec2';
import { LayoutManager } from './layout';

export class UISystem {
  private widgets = new Map<string, UIWidget>();
  private rootWidgets: string[] = []; // Widgets without parents
  private layoutManager = new LayoutManager();

  /**
   * Add widget
   */
  addWidget(widget: UIWidget, parentId?: string): void {
    this.widgets.set(widget.id, widget);

    if (parentId) {
      const parent = this.widgets.get(parentId);
      if (parent) {
        parent.children.push(widget.id);
        widget.parent = parentId;
      }
    } else {
      this.rootWidgets.push(widget.id);
    }

    this.updateLayout();
  }

  /**
   * Remove widget
   */
  removeWidget(id: string): void {
    const widget = this.widgets.get(id);
    if (!widget) {
      return;
    }

    // Remove from parent
    if (widget.parent) {
      const parent = this.widgets.get(widget.parent);
      if (parent) {
        const index = parent.children.indexOf(id);
        if (index >= 0) {
          parent.children.splice(index, 1);
        }
      }
    } else {
      const index = this.rootWidgets.indexOf(id);
      if (index >= 0) {
        this.rootWidgets.splice(index, 1);
      }
    }

    // Remove children
    for (const childId of widget.children) {
      this.removeWidget(childId);
    }

    this.widgets.delete(id);
  }

  /**
   * Get widget
   */
  getWidget(id: string): UIWidget | undefined {
    return this.widgets.get(id);
  }

  /**
   * Get all widgets
   */
  getAllWidgets(): UIWidget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get root widgets
   */
  getRootWidgets(): UIWidget[] {
    return this.rootWidgets.map(id => this.widgets.get(id)).filter((w): w is UIWidget => w !== undefined);
  }

  /**
   * Set widget visibility
   */
  setVisible(id: string, visible: boolean): void {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.visible = visible;
    }
  }

  /**
   * Set widget enabled state
   */
  setEnabled(id: string, enabled: boolean): void {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.enabled = enabled;
    }
  }

  /**
   * Set text widget text
   */
  setText(id: string, text: string): void {
    const widget = this.widgets.get(id);
    if (widget && widget.type === WidgetType.Text) {
      widget.text = text;
    }
  }

  /**
   * Handle mouse input
   */
  handleMouseInput(x: number, y: number, button: number, pressed: boolean): void {
    const point = new Vec2(x, y);
    const widget = this.findWidgetAtPoint(point);

    if (pressed && button === 0) {
      // Left click
      if (widget) {
        const w = this.widgets.get(widget);
        if (w && w.type === WidgetType.Button && w.enabled) {
          w.onClick?.();
        }
      }
    }
  }

  /**
   * Find widget at point
   */
  private findWidgetAtPoint(point: Vec2): string | null {
    // Check widgets in reverse z-order (top to bottom)
    const sortedWidgets = Array.from(this.widgets.values())
      .filter(w => w.visible && w.enabled)
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const widget of sortedWidgets) {
      if (this.isPointInWidget(point, widget)) {
        return widget.id;
      }
    }

    return null;
  }

  /**
   * Check if point is in widget
   */
  private isPointInWidget(point: Vec2, widget: UIWidget): boolean {
    return (
      point.x >= widget.position.x &&
      point.x <= widget.position.x + widget.size.x &&
      point.y >= widget.position.y &&
      point.y <= widget.position.y + widget.size.y
    );
  }

  /**
   * Update layout
   */
  private updateLayout(): void {
    // Simple layout update - would be more sophisticated in full implementation
    for (const rootId of this.rootWidgets) {
      const root = this.widgets.get(rootId);
      if (root) {
        this.layoutWidget(root, Vec2.zero());
      }
    }
  }

  /**
   * Layout widget and children
   */
  private layoutWidget(widget: UIWidget, parentPosition: Vec2): void {
    this.layoutManager.calculateLayout(widget, new Vec2(800, 600), parentPosition);

    if (widget.children.length > 0) {
      const children = widget.children
        .map(id => this.widgets.get(id))
        .filter((w): w is UIWidget => w !== undefined);
      this.layoutManager.layoutChildren(widget, children);

      for (const child of children) {
        this.layoutWidget(child, widget.position);
      }
    }
  }

  /**
   * Clear all widgets
   */
  clear(): void {
    this.widgets.clear();
    this.rootWidgets = [];
  }
}
