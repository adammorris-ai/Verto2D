/**
 * UI Widget definitions
 */

import { Vec2 } from '../core/math/vec2';
import { Color } from '../core/math/color';

export enum WidgetType {
  Panel = 'panel',
  Text = 'text',
  Button = 'button',
  Image = 'image',
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: Vec2;
  size: Vec2;
  visible: boolean;
  enabled: boolean;
  zIndex: number;
  parent?: string; // Parent widget ID
  children: string[]; // Child widget IDs
  data: Record<string, unknown>; // Widget-specific data
}

export interface TextWidget extends Widget {
  type: WidgetType.Text;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: Color;
  align: 'left' | 'center' | 'right';
}

export interface ButtonWidget extends Widget {
  type: WidgetType.Button;
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: Color;
  backgroundColor: Color;
  hoverColor?: Color;
  onClick?: () => void;
}

export interface PanelWidget extends Widget {
  type: WidgetType.Panel;
  backgroundColor: Color;
  borderColor?: Color;
  borderWidth?: number;
}

export type UIWidget = TextWidget | ButtonWidget | PanelWidget;

/**
 * Create text widget
 */
export function createTextWidget(
  id: string,
  text: string,
  position: Vec2,
  fontSize: number = 16
): TextWidget {
  return {
    id,
    type: WidgetType.Text,
    text,
    position: position.clone(),
    size: new Vec2(100, fontSize),
    visible: true,
    enabled: true,
    zIndex: 0,
    children: [],
    fontSize,
    fontFamily: 'Arial',
    color: Color.white(),
    align: 'left',
    data: {},
  };
}

/**
 * Create button widget
 */
export function createButtonWidget(
  id: string,
  text: string,
  position: Vec2,
  size: Vec2,
  onClick?: () => void
): ButtonWidget {
  return {
    id,
    type: WidgetType.Button,
    text,
    position: position.clone(),
    size: size.clone(),
    visible: true,
    enabled: true,
    zIndex: 0,
    children: [],
    fontSize: 16,
    fontFamily: 'Arial',
    textColor: Color.white(),
    backgroundColor: new Color(0.2, 0.2, 0.2, 1),
    onClick,
    data: {},
  };
}

/**
 * Create panel widget
 */
export function createPanelWidget(
  id: string,
  position: Vec2,
  size: Vec2
): PanelWidget {
  return {
    id,
    type: WidgetType.Panel,
    position: position.clone(),
    size: size.clone(),
    visible: true,
    enabled: true,
    zIndex: 0,
    children: [],
    backgroundColor: new Color(0.1, 0.1, 0.1, 0.8),
    data: {},
  };
}
