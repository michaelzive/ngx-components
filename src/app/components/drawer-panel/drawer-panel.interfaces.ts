import { TemplateRef } from '@angular/core';

export type DrawerDock = 'left' | 'right' | 'top' | 'bottom';
export type DrawerMode = 'over' | 'push';

export interface DrawerPanelTab {
  id?: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: TemplateRef<any>;
  data?: any;
  ariaLabel?: string;
}

export interface DrawerPanelResizeEvent {
  size: number;
  dock: DrawerDock;
  isResizing: boolean;
}

export interface DrawerPanelTabChangeEvent {
  index: number;
  tab: DrawerPanelTab;
}

export interface DrawerPanelConfig {
  dock: DrawerDock;
  mode: DrawerMode;
  hasBackdrop: boolean;
  initialSize: number; // width or height depending on orientation
  minSize: number;
  maxSize: number;
  collapsedThickness: number; // thickness when collapsed (tab strip)
  resizable: boolean;
  autoFocus: boolean;
}

export const DEFAULT_DRAWER_PANEL_CONFIG: DrawerPanelConfig = {
  dock: 'left',
  mode: 'over',
  hasBackdrop: false,
  initialSize: 320,
  minSize: 240,
  maxSize: 960,
  collapsedThickness: 48,
  resizable: true,
  autoFocus: true
};
