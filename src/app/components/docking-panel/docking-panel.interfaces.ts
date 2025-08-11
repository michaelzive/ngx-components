import { TemplateRef } from '@angular/core';

export type DockingSide = 'left' | 'right' | 'top' | 'bottom';
export type DockingMode = 'overlay' | 'push';

export interface DockingPanelTab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: TemplateRef<any>;
  data?: any;
  ariaLabel?: string;
}

export interface DockingPanelConfig {
  side: DockingSide;
  mode: DockingMode;
  hasBackdrop: boolean;
  closeOnBackdropClick: boolean;
  initialSize: number;
  minSize: number;
  maxSize: number;
  collapsedSize: number;
  resizable: boolean;
  autoFocus: boolean;
  animationDuration: number;
}

export interface DockingPanelTabChangeEvent {
  index: number;
  tab: DockingPanelTab;
  previousIndex: number;
}

export interface DockingPanelStateChangeEvent {
  expanded: boolean;
  activeTabIndex: number;
  size: number;
  side: DockingSide;
}

export interface DockingPanelResizeEvent {
  size: number;
  side: DockingSide;
  isResizing: boolean;
  delta: number;
}

export const DEFAULT_DOCKING_PANEL_CONFIG: DockingPanelConfig = {
  side: 'left',
  mode: 'push',
  hasBackdrop: false,
  closeOnBackdropClick: true,
  initialSize: 320,
  minSize: 200,
  maxSize: 800,
  collapsedSize: 48,
  resizable: true,
  autoFocus: false,
  animationDuration: 250
};