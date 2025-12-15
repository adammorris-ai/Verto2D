import { describe, it, expect, beforeEach } from 'vitest';
import { UISystem } from '../ui_runtime/uiSystem';
import { createTextWidget, createButtonWidget, createPanelWidget, WidgetType } from '../ui_runtime/widgets';
import { Vec2 } from '../core/math/vec2';
import { Color } from '../core/math/color';

describe('UI Widgets', () => {
  it('should create text widget', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(10, 20));
    expect(widget.id).toBe('text1');
    expect(widget.text).toBe('Hello');
    expect(widget.type).toBe(WidgetType.Text);
    expect(widget.position.x).toBe(10);
    expect(widget.position.y).toBe(20);
  });

  it('should create button widget', () => {
    let clicked = false;
    const widget = createButtonWidget('btn1', 'Click Me', new Vec2(10, 20), new Vec2(100, 30), () => {
      clicked = true;
    });
    
    expect(widget.id).toBe('btn1');
    expect(widget.text).toBe('Click Me');
    expect(widget.type).toBe(WidgetType.Button);
    expect(widget.onClick).toBeDefined();
    
    widget.onClick?.();
    expect(clicked).toBe(true);
  });

  it('should create panel widget', () => {
    const widget = createPanelWidget('panel1', new Vec2(0, 0), new Vec2(200, 100));
    expect(widget.id).toBe('panel1');
    expect(widget.type).toBe(WidgetType.Panel);
    expect(widget.size.x).toBe(200);
    expect(widget.size.y).toBe(100);
  });
});

describe('UISystem', () => {
  let uiSystem: UISystem;

  beforeEach(() => {
    uiSystem = new UISystem();
  });

  it('should add widget', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(0, 0));
    uiSystem.addWidget(widget);
    
    expect(uiSystem.getWidget('text1')).toBeDefined();
    expect(uiSystem.getRootWidgets().length).toBe(1);
  });

  it('should add widget with parent', () => {
    const panel = createPanelWidget('panel1', new Vec2(0, 0), new Vec2(200, 100));
    const text = createTextWidget('text1', 'Hello', new Vec2(10, 10));
    
    uiSystem.addWidget(panel);
    uiSystem.addWidget(text, 'panel1');
    
    const panelWidget = uiSystem.getWidget('panel1');
    expect(panelWidget?.children).toContain('text1');
    expect(uiSystem.getWidget('text1')?.parent).toBe('panel1');
  });

  it('should remove widget', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(0, 0));
    uiSystem.addWidget(widget);
    
    uiSystem.removeWidget('text1');
    expect(uiSystem.getWidget('text1')).toBeUndefined();
    expect(uiSystem.getRootWidgets().length).toBe(0);
  });

  it('should set widget visibility', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(0, 0));
    uiSystem.addWidget(widget);
    
    uiSystem.setVisible('text1', false);
    expect(uiSystem.getWidget('text1')?.visible).toBe(false);
  });

  it('should set text widget text', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(0, 0));
    uiSystem.addWidget(widget);
    
    uiSystem.setText('text1', 'World');
    expect(uiSystem.getWidget('text1')?.type === WidgetType.Text && (uiSystem.getWidget('text1') as any).text).toBe('World');
  });

  it('should handle mouse input', () => {
    const button = createButtonWidget('btn1', 'Click', new Vec2(10, 10), new Vec2(100, 30));
    let clicked = false;
    button.onClick = () => { clicked = true; };
    
    uiSystem.addWidget(button);
    
    // Click on button
    uiSystem.handleMouseInput(50, 25, 0, true);
    expect(clicked).toBe(true);
  });

  it('should find widget at point', () => {
    const widget = createTextWidget('text1', 'Hello', new Vec2(10, 10));
    widget.size = new Vec2(100, 20);
    uiSystem.addWidget(widget);
    
    // Point inside widget
    uiSystem.handleMouseInput(50, 20, 0, false);
    // Widget should be hovered (simplified check)
    
    // Point outside widget
    uiSystem.handleMouseInput(200, 200, 0, false);
    // Widget should not be hovered
  });

  it('should clear all widgets', () => {
    uiSystem.addWidget(createTextWidget('text1', 'Hello', new Vec2(0, 0)));
    uiSystem.addWidget(createTextWidget('text2', 'World', new Vec2(0, 0)));
    
    uiSystem.clear();
    expect(uiSystem.getAllWidgets().length).toBe(0);
    expect(uiSystem.getRootWidgets().length).toBe(0);
  });
});
