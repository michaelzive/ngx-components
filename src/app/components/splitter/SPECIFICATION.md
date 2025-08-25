# Splitter Component Specification

## Overview

The Splitter system provides a resizable two-pane container component that allows users to dynamically adjust the relative sizes of content areas. It supports both horizontal and vertical layouts with comprehensive keyboard accessibility and touch/mouse interaction.

## Components

### 1. SplitterComponent (`splitter.component.ts`)

**Selector**: `app-splitter`

#### Core Functionality
- Two-pane resizable container with draggable handle
- Percentage-based sizing for responsive layouts
- Horizontal and vertical orientations
- Size constraints with minimum/maximum limits
- Keyboard navigation with configurable step sizes
- RTL (Right-to-Left) layout support
- Modern pointer events for all input types

#### Input Properties (Signals)
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layout` | `SplitterLayout` | `'horizontal'` | Splitter orientation |
| `panelSizes` | `[number, number] \| undefined` | `undefined` | Initial panel sizes as percentages |
| `minSizes` | `[number, number]` | `[10, 10]` | Minimum sizes as percentages |
| `step` | `number` | `2` | Keyboard resize step size |
| `largeStep` | `number` | `10` | Large keyboard resize step (with modifiers) |
| `disabled` | `boolean` | `false` | Disable resize functionality |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `sizesChange` | `[number, number]` | Emitted when panel sizes change |

#### Public Methods
- `reset()`: Reset panels to initial or default sizes
- `hasTwoPanels()`: Check if exactly two panels are present

#### Internal State (Readonly Signals)
- `sizes()`: Current panel sizes as percentages
- `dragging()`: Whether resize is currently active
- `isHorizontal()`: Whether layout is horizontal
- `isVertical()`: Whether layout is vertical
- `firstSizeRounded()`: First panel size rounded to integer
- `ariaControls()`: Space-separated panel IDs for ARIA

#### Interaction Methods

##### Mouse/Touch Resize
- Visual drag handle positioned at split point
- Pointer capture for reliable interaction
- Real-time size updates during drag
- Constraint enforcement (min/max sizes)
- RTL-aware coordinate handling

##### Keyboard Resize
| Key Combination | Action |
|-----------------|--------|
| `Arrow Keys` | Resize by `step` amount |
| `Ctrl/Alt/Shift + Arrow` | Resize by `largeStep` amount |
| `Home` | Set first panel to minimum size |
| `End` | Set first panel to maximum size |

#### Accessibility Features
- ARIA separator role for resize handle
- `aria-orientation` indicating layout direction
- `aria-controls` referencing both panels
- `aria-valuenow/min/max` for current size values
- `aria-valuetext` with percentage description
- Screen reader live region for size announcements
- Keyboard focus management
- High contrast mode support

### 2. SplitterPanelComponent (`splitter-panel.component.ts`)

**Selector**: `app-splitter-panel`

#### Core Functionality
- Individual panel container within the splitter
- Automatic ID generation for ARIA references
- Flexible content projection
- Responsive sizing handled by parent splitter

#### Input Properties (Signals)
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ariaLabel` | `string \| undefined` | `undefined` | Accessibility label for panel region |

#### Public Methods
- `id()`: Get the unique panel identifier

#### Template Structure
```html
<div class="panel-content" [attr.aria-label]="ariaLabel() || null" role="region">
  <ng-content></ng-content>
</div>
```

## Types

### SplitterLayout
```typescript
type SplitterLayout = 'horizontal' | 'vertical';
```

## Usage Examples

### Basic Horizontal Splitter
```html
<app-splitter layout="horizontal" [panelSizes]="[30, 70]">
  <app-splitter-panel ariaLabel="Navigation">
    <div>Left panel content</div>
  </app-splitter-panel>
  <app-splitter-panel ariaLabel="Main content">
    <div>Right panel content</div>
  </app-splitter-panel>
</app-splitter>
```

### Vertical Splitter with Constraints
```html
<app-splitter 
  layout="vertical" 
  [minSizes]="[20, 30]"
  [step]="5"
  [largeStep]="15"
  (sizesChange)="onSizeChange($event)">
  <app-splitter-panel ariaLabel="Header">
    <div>Top panel content</div>
  </app-splitter-panel>
  <app-splitter-panel ariaLabel="Main">
    <div>Bottom panel content</div>
  </app-splitter-panel>
</app-splitter>
```

### Disabled Splitter
```html
<app-splitter [disabled]="true" [panelSizes]="[50, 50]">
  <app-splitter-panel>
    <div>Fixed left panel</div>
  </app-splitter-panel>
  <app-splitter-panel>
    <div>Fixed right panel</div>
  </app-splitter-panel>
</app-splitter>
```

### Reactive Size Management
```typescript
export class MyComponent {
  panelSizes = signal<[number, number]>([40, 60]);
  
  onSizeChange(sizes: [number, number]) {
    this.panelSizes.set(sizes);
    // Save to localStorage, etc.
  }
  
  resetLayout() {
    this.splitterRef.reset();
  }
}
```

## Styling

### CSS Custom Properties
```css
:root {
  --splitter-gap: 0px;                    /* Gap between panels */
  --splitter-handle-size: 8px;            /* Handle thickness */
  --splitter-handle-color: #d0d5dd;       /* Handle default color */
  --splitter-handle-color-active: #98a2b3; /* Handle active/hover color */
  --splitter-handle-radius: 6px;          /* Handle border radius */
}
```

### CSS Classes
- `.app-splitter`: Host element class
- `.splitter-root`: Main container
- `.splitter-handle`: Resize handle
- `.splitter-handle.horizontal`: Horizontal layout handle
- `.splitter-handle.vertical`: Vertical layout handle
- `.splitter-handle.dragging`: Active drag state
- `.splitter-panel`: Panel container class
- `.sr-only`: Screen reader only content

### Layout Behavior
- **Horizontal**: Panels arranged left-to-right with vertical handle
- **Vertical**: Panels arranged top-to-bottom with horizontal handle
- **Flex-based**: Uses CSS flexbox with percentage-based flex-basis
- **Responsive**: Automatically adjusts to container size changes

## Size Management

### Normalization Algorithm
The component automatically normalizes panel sizes to ensure:
1. Sizes are non-negative finite numbers
2. Total equals 100%
3. Each panel respects its minimum size constraint
4. Floating-point precision is maintained (rounded to 3 decimals)

### Constraint Handling
- **Minimum sizes**: Enforced during resize and normalization
- **Boundary clamping**: Prevents panels from becoming too small
- **Proportional adjustment**: Maintains total 100% while respecting constraints

## Technical Implementation

### Angular 19 Features
- Standalone component architecture
- Signal-based reactive state management
- Modern input/output function syntax
- Control flow templates (@if)
- OnPush change detection strategy

### Performance Optimizations
- RequestAnimationFrame for smooth drag updates
- ResizeObserver for container size changes
- Efficient signal-based reactivity
- Minimal DOM manipulation
- Pointer capture for reliable interaction

### Browser Compatibility
- Modern pointer events (IE11+ with polyfill)
- CSS custom properties (IE11+ with polyfill)  
- Flexbox layout (IE10+)
- ResizeObserver (with fallback for older browsers)

## Error Handling

### Validation
- Requires exactly two `app-splitter-panel` children
- Throws descriptive error if panel count is incorrect
- Graceful fallback for invalid size inputs

### Edge Cases
- Handles container resize during drag
- RTL layout coordinate transformations
- Touch event normalization
- Keyboard modifier detection

## Accessibility Compliance

### WCAG Guidelines
- **2.1.1 Keyboard**: Full keyboard operation
- **2.4.6 Headings and Labels**: Descriptive labels
- **4.1.2 Name, Role, Value**: Proper ARIA implementation
- **4.1.3 Status Messages**: Live region announcements

### Screen Reader Support
- Announces current panel sizes
- Describes resize functionality
- Provides context for panel relationships

### Motor Impairment Support
- Large invisible hit areas for handles
- Keyboard alternatives to mouse interaction
- Configurable step sizes for fine control

## Integration Notes

- Compatible with Angular 19+ applications
- No external dependencies beyond Angular core
- Works with Server-Side Rendering (SSR)
- Supports Content Security Policy (CSP)
- RTL layout compatible
- Mobile-friendly touch interactions