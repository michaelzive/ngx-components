# Docking Panel Component Specification

## Overview

The Docking Panel system provides a comprehensive solution for creating collapsible, dockable panels that can be positioned on any edge of the viewport. The system supports tabbed content, resizable panels, and intelligent layout coordination between multiple panels.

## Components

### 1. DockingPanelComponent (`docking-panel.component.ts`)

**Selector**: `app-docking-panel`

#### Core Functionality
- Collapsible panel that can dock to left, right, top, or bottom edges
- Supports two interaction modes: overlay and push
- Tab-based content system with keyboard navigation
- Mouse, touch, and keyboard resize capabilities
- Smooth animations for expand/collapse operations

#### Input Properties (Signals)
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `side` | `DockingSide` | `'left'` | Panel docking position |
| `mode` | `DockingMode` | `'push'` | Interaction mode (overlay/push) |
| `hasBackdrop` | `boolean` | `false` | Show backdrop in overlay mode |
| `closeOnBackdropClick` | `boolean` | `true` | Close panel on backdrop click |
| `initialSize` | `number` | `320` | Initial panel size in pixels |
| `minSize` | `number` | `200` | Minimum panel size in pixels |
| `maxSize` | `number` | `800` | Maximum panel size in pixels |
| `collapsedSize` | `number` | `48` | Size when collapsed (tab strip) |
| `resizable` | `boolean` | `true` | Allow panel resizing |
| `autoFocus` | `boolean` | `false` | Auto-expand on content init |
| `animationDuration` | `number` | `250` | Animation duration in ms |
| `tabs` | `DockingPanelTab[]` | `[]` | Programmatic tab definitions |
| `layoutManaged` | `boolean` | `false` | Managed by layout component |
| `globalAnchored` | `boolean` | `false` | Fixed to viewport |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `tabChange` | `DockingPanelTabChangeEvent` | Active tab changed |
| `stateChange` | `DockingPanelStateChangeEvent` | Panel expand/collapse state changed |
| `sizeChange` | `DockingPanelResizeEvent` | Panel size changed during resize |
| `backdropClick` | `void` | Backdrop clicked in overlay mode |

#### Public Methods
- `expand()`: Expand the panel
- `collapse()`: Collapse the panel
- `toggle()`: Toggle panel state
- `setCrossAxisOffsets(offsets)`: Set positioning offsets (internal use)

#### Accessibility Features
- Full ARIA implementation with proper roles and labels
- Keyboard navigation for tabs (arrow keys, Home, End)
- Resizable handle with keyboard support (Shift + arrow keys)
- Screen reader announcements for state changes
- High contrast mode support
- Reduced motion support

### 2. DockingLayoutComponent (`docking-layout.component.ts`)

**Selector**: `app-docking-layout`

#### Core Functionality
- Coordinates multiple docking panels
- Manages cross-axis positioning to prevent overlaps
- Calculates aggregate margins for main content
- Supports global anchoring (viewport-fixed panels)

#### Input Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `includeCollapsedStripInOffset` | `boolean` | `true` | Include collapsed size in push calculations |
| `globalAnchored` | `boolean` | `false` | Anchor panels to viewport |
| `manageCrossAxisClearance` | `boolean` | `true` | Prevent panel overlaps |
| `crossAxisTransition` | `string` | `'250ms ease'` | Transition for panel movement |
| `globalAnchoredPushMode` | `'full' \| 'collapsed' \| 'none'` | `'full'` | Push behavior for anchored panels |

### 3. DockingPanelTabDirective (`docking-panel-tab.directive.ts`)

**Selector**: `ng-template[dockingPanelTab]`

#### Core Functionality
- Content projection directive for tab-based content
- Allows declarative tab definition within panel

#### Input Properties
| Property | Type | Description |
|----------|------|-------------|
| `dockingPanelTab` | `string` | Tab label (required) |
| `icon` | `string` | Material icon name |
| `disabled` | `boolean` | Disable tab |
| `id` | `string` | Unique tab identifier |
| `ariaLabel` | `string` | Accessibility label |
| `data` | `any` | Custom tab data |

## Interfaces

### DockingPanelTab
```typescript
interface DockingPanelTab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: TemplateRef<any>;
  data?: any;
  ariaLabel?: string;
}
```

### DockingPanelConfig
```typescript
interface DockingPanelConfig {
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
```

## Usage Examples

### Basic Panel
```html
<app-docking-panel side="left" [initialSize]="300">
  <ng-template dockingPanelTab="Files" icon="folder">
    <div>File explorer content</div>
  </ng-template>
</app-docking-panel>
```

### Multi-Panel Layout
```html
<app-docking-layout>
  <app-docking-panel side="left">
    <ng-template dockingPanelTab="Explorer" icon="folder">
      <div>Explorer content</div>
    </ng-template>
  </app-docking-panel>
  
  <app-docking-panel side="right">
    <ng-template dockingPanelTab="Properties" icon="settings">
      <div>Properties panel</div>
    </ng-template>
  </app-docking-panel>
  
  <div>Main content area</div>
</app-docking-layout>
```

### Programmatic Tabs
```typescript
tabs = [
  { id: 'tab1', label: 'Tab 1', icon: 'home' },
  { id: 'tab2', label: 'Tab 2', icon: 'settings' }
];
```

```html
<app-docking-panel [tabs]="tabs">
  <!-- Main content -->
</app-docking-panel>
```

## Styling

### CSS Custom Properties
- `--docking-panel-z-index`: Panel stacking order
- `--docking-panel-tab-size`: Tab strip size
- `--docking-panel-border-color`: Panel border color
- `--docking-panel-background`: Panel background color
- `--docking-panel-cross-axis-transition`: Cross-axis movement duration

### CSS Classes
- `.docking-panel-container`: Main panel container
- `.docking-panel-[side]`: Position-specific classes
- `.docking-panel-mode-[mode]`: Mode-specific classes
- `.docking-panel-expanded/collapsed`: State classes
- `.docking-panel-resizing`: Active resize state

### Debug Classes
- `.docking-panel-debug-outline`: Visual debugging outlines
- `.dock-debug`: Vivid color debugging mode

## Animation System

The component uses Angular Animations with three main triggers:
- `panelState`: Main expand/collapse animations
- `contentFade`: Content fade in/out transitions  
- `backdropFade`: Backdrop appearance transitions

## Responsive Design

- Mobile-optimized tab sizes (768px breakpoint)
- Touch-friendly interaction targets
- Reduced motion support
- High contrast mode compatibility

## Integration Notes

- Works with Angular 19+ standalone components
- Requires Angular Material for icons and theming
- Uses modern Angular signals for reactivity
- Compatible with SSR (server-side rendering)
- Supports RTL (right-to-left) layouts

## Performance Considerations

- OnPush change detection strategy
- Efficient signal-based state management
- RequestAnimationFrame for smooth animations
- Proper cleanup of event listeners and observers