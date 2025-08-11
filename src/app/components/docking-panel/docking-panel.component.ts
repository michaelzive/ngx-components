import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, style, transition, trigger, state } from '@angular/animations';
import {
  DockingSide,
  DockingMode,
  DockingPanelTab,
  DockingPanelTabChangeEvent,
  DockingPanelStateChangeEvent,
  DockingPanelResizeEvent,
  DEFAULT_DOCKING_PANEL_CONFIG
} from './docking-panel.interfaces';
import { DockingPanelTabDirective } from './docking-panel-tab.directive';

@Component({
  selector: 'app-docking-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './docking-panel.component.html',
  styleUrl: './docking-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('panelState', [
      state('expanded-left', style({
        transform: 'translateX(0)',
        width: '{{size}}px'
      }), { params: { size: 320 } }),
      state('collapsed-left', style({
        transform: 'translateX(calc(-100% + {{collapsedSize}}px))',
        width: '{{size}}px'
      }), { params: { size: 320, collapsedSize: 48 } }),
      state('expanded-right', style({
        transform: 'translateX(0)',
        width: '{{size}}px'
      }), { params: { size: 320 } }),
      state('collapsed-right', style({
        transform: 'translateX(calc(100% - {{collapsedSize}}px))',
        width: '{{size}}px'
      }), { params: { size: 320, collapsedSize: 48 } }),
      state('expanded-top', style({
        transform: 'translateY(0)',
        height: '{{size}}px'
      }), { params: { size: 320 } }),
      state('collapsed-top', style({
        transform: 'translateY(calc(-100% + {{collapsedSize}}px))',
        height: '{{size}}px'
      }), { params: { size: 320, collapsedSize: 48 } }),
      state('expanded-bottom', style({
        transform: 'translateY(0)',
        height: '{{size}}px'
      }), { params: { size: 320 } }),
      state('collapsed-bottom', style({
        transform: 'translateY(calc(100% - {{collapsedSize}}px))',
        height: '{{size}}px'
      }), { params: { size: 320, collapsedSize: 48 } }),
      transition('* => *', animate('{{duration}}ms ease-out'))
    ]),
    trigger('contentFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DockingPanelComponent implements AfterContentInit, OnDestroy, OnInit, OnChanges {
  // Inputs as signals
  readonly side = input<DockingSide>(DEFAULT_DOCKING_PANEL_CONFIG.side);
  readonly mode = input<DockingMode>(DEFAULT_DOCKING_PANEL_CONFIG.mode);
  readonly hasBackdrop = input<boolean>(DEFAULT_DOCKING_PANEL_CONFIG.hasBackdrop);
  readonly closeOnBackdropClick = input<boolean>(DEFAULT_DOCKING_PANEL_CONFIG.closeOnBackdropClick);
  readonly initialSize = input<number>(DEFAULT_DOCKING_PANEL_CONFIG.initialSize);
  readonly minSize = input<number>(DEFAULT_DOCKING_PANEL_CONFIG.minSize);
  readonly maxSize = input<number>(DEFAULT_DOCKING_PANEL_CONFIG.maxSize);
  readonly collapsedSize = input<number>(DEFAULT_DOCKING_PANEL_CONFIG.collapsedSize);
  readonly resizable = input<boolean>(DEFAULT_DOCKING_PANEL_CONFIG.resizable);
  readonly autoFocus = input<boolean>(DEFAULT_DOCKING_PANEL_CONFIG.autoFocus);
  readonly animationDuration = input<number>(DEFAULT_DOCKING_PANEL_CONFIG.animationDuration);
  readonly tabs = input<DockingPanelTab[]>([]);
  // When true, panel participates in external layout host which applies push margins.
  private readonly _layoutManaged = signal<boolean>(false);
  @Input() set layoutManaged(value: boolean) { this._layoutManaged.set(value); }
  get isLayoutManaged() { return this._layoutManaged(); }

  // When true (set by layout), panel is anchored to viewport via position:fixed
  private readonly _globalAnchored = signal<boolean>(false);
  @Input() set globalAnchored(value: boolean) { this._globalAnchored.set(value); }
  get isGlobalAnchored() { return this._globalAnchored(); }

  // Outputs
  readonly tabChange = output<DockingPanelTabChangeEvent>();
  readonly stateChange = output<DockingPanelStateChangeEvent>();
  readonly sizeChange = output<DockingPanelResizeEvent>();
  readonly backdropClick = output<void>();

  // Template references
  @ContentChildren(DockingPanelTabDirective) projectedTabs!: QueryList<DockingPanelTabDirective>;
  @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>;
  @ViewChild('panel') panelElement!: ElementRef<HTMLDivElement>;

  // Internal state signals
  readonly isExpanded = signal<boolean>(false);
  readonly activeTabIndex = signal<number>(0);
  readonly currentSize = signal<number>(this.initialSize());
  readonly isResizing = signal<boolean>(false);

  // Computed properties
  readonly isHorizontalDock = computed(() => this.side() === 'top' || this.side() === 'bottom');
  readonly isVerticalDock = computed(() => !this.isHorizontalDock());
  readonly isOverlayMode = computed(() => this.mode() === 'overlay');
  readonly isPushMode = computed(() => this.mode() === 'push');
  readonly showBackdrop = computed(() => this.hasBackdrop() && this.isExpanded() && this.isOverlayMode());

  // Tab management
  private readonly projectedTabList = signal<DockingPanelTab[]>([]);
  readonly allTabs = computed(() => {
    const projected = this.projectedTabList();
    const programmatic = this.tabs();
    return [...projected, ...programmatic].filter(tab => !tab.disabled);
  });
  readonly activeTab = computed(() => this.allTabs()[this.activeTabIndex()] || null);

  // Animation state
  readonly animationState = computed(() => {
    const state = this.isExpanded() ? 'expanded' : 'collapsed';
    return `${state}-${this.side()}`;
  });

  readonly animationParams = computed(() => ({
    size: this.currentSize(),
    collapsedSize: this.collapsedSize(),
    duration: this.animationDuration()
  }));

  readonly containerInlineStyle = computed(() => {
    if (!this.isGlobalAnchored || !this.isLayoutManaged) return '';
    // For fixed panels spanning appropriate dimension, we just rely on side classes.
    // Additional constraints can be added here if needed.
    const off = this.crossAxisOffsets();
    const pieces: string[] = ['position:fixed'];
    if (this.side() === 'left' || this.side() === 'right') {
      pieces.push(`top:${off.top}px`);
      pieces.push(`bottom:${off.bottom}px`);
    } else {
      pieces.push(`left:${off.left}px`);
      pieces.push(`right:${off.right}px`);
    }
    return pieces.join(';');
  });

  // Cross-axis offsets supplied by layout so tabs won’t be hidden
  private readonly crossAxisOffsets = signal({ top: 0, bottom: 0, left: 0, right: 0 });
  setCrossAxisOffsets(offsets: { top: number; bottom: number; left: number; right: number }) {
    this.crossAxisOffsets.set(offsets);
  }

  // Resize handling
  private dragStart = { x: 0, y: 0, size: 0 };
  private boundMouseMove = (e: MouseEvent) => this.onMouseMove(e);
  private boundMouseUp = () => this.onMouseUp();
  private boundTouchMove = (e: TouchEvent) => this.onTouchMove(e);
  private boundTouchEnd = () => this.onTouchEnd();

  constructor() {}

  ngOnInit(): void {
    // Apply bound initial size after inputs resolved
    this.currentSize.set(this.initialSize());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSize'] && !this.isResizing()) {
      // If initialSize input changes dynamically, sync current size only when not resizing
      this.currentSize.set(this.initialSize());
    }
  }

  ngAfterContentInit(): void {
    this.updateProjectedTabs();
    this.projectedTabs.changes.subscribe(() => this.updateProjectedTabs());

    if (this.autoFocus() && this.allTabs().length > 0) {
      queueMicrotask(() => this.expand());
    }
  }

  ngOnDestroy(): void {
    this.removeGlobalListeners();
  }

  private updateProjectedTabs(): void {
    const tabs: DockingPanelTab[] = this.projectedTabs?.map((directive, index) => ({
      id: directive.id || `projected-${index}`,
      label: directive.label,
      icon: directive.icon,
      disabled: directive.disabled || false,
      content: directive.template,
      data: directive.data,
      ariaLabel: directive.ariaLabel || directive.label
    })) || [];
    this.projectedTabList.set(tabs);

    // Ensure activeTabIndex is within bounds
    const allTabs = this.allTabs();
    if (allTabs.length === 0) {
      this.activeTabIndex.set(0);
    } else if (this.activeTabIndex() >= allTabs.length) {
      this.activeTabIndex.set(Math.max(0, allTabs.length - 1));
    }
  }

  // Tab interaction
  onTabClick(index: number): void {
    const allTabs = this.allTabs();
    if (index < 0 || index >= allTabs.length) {
      return; // Invalid index
    }

    const previousIndex = this.activeTabIndex();

    if (this.activeTabIndex() === index && this.isExpanded()) {
      this.collapse();
    } else {
      this.activeTabIndex.set(index);
      if (!this.isExpanded()) {
        this.expand();
      }
      this.emitTabChange(index, previousIndex);
    }
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const { key, shiftKey } = event;

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        if (this.isHorizontalDock() ? key === 'ArrowLeft' : key === 'ArrowUp') {
          event.preventDefault();
          this.navigateTab(-1);
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        if (this.isHorizontalDock() ? key === 'ArrowRight' : key === 'ArrowDown') {
          event.preventDefault();
          this.navigateTab(1);
        }
        break;
      case 'Home':
        event.preventDefault();
        this.activeTabIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeTabIndex.set(this.allTabs().length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onTabClick(index);
        break;
      case 'Escape':
        if (this.isExpanded()) {
          event.preventDefault();
          this.collapse();
        }
        break;
    }
  }

  private navigateTab(direction: number): void {
    const tabs = this.allTabs();
    let newIndex = this.activeTabIndex() + direction;

    if (newIndex < 0) newIndex = tabs.length - 1;
    if (newIndex >= tabs.length) newIndex = 0;

    this.activeTabIndex.set(newIndex);
  }

  // Panel state management
  expand(): void {
    if (this.isExpanded()) return;
    this.isExpanded.set(true);
    this.emitStateChange();
  }

  collapse(): void {
    if (!this.isExpanded()) return;
    this.isExpanded.set(false);
    this.emitStateChange();
  }

  toggle(): void {
    this.isExpanded() ? this.collapse() : this.expand();
  }

  // Backdrop interaction
  onBackdropClick(): void {
    this.backdropClick.emit();
    if (this.closeOnBackdropClick()) {
      this.collapse();
    }
  }

  // Resize handling
  onResizeStart(event: MouseEvent | TouchEvent): void {
    if (!this.resizable() || !this.isExpanded()) return;

    event.preventDefault();
    this.isResizing.set(true);

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    this.dragStart = {
      x: clientX,
      y: clientY,
      size: this.currentSize()
    };

    if (event instanceof MouseEvent) {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
    } else {
      document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      document.addEventListener('touchend', this.boundTouchEnd);
    }

    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.isHorizontalDock() ? 'row-resize' : 'col-resize';
  }

  private onMouseMove(event: MouseEvent): void {
    this.handleResize(event.clientX, event.clientY);
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleResize(touch.clientX, touch.clientY);
  }

  private handleResize(clientX: number, clientY: number): void {
    if (!this.isResizing()) return;

    const deltaX = clientX - this.dragStart.x;
    const deltaY = clientY - this.dragStart.y;
    let delta = 0;

    switch (this.side()) {
      case 'left':
        delta = deltaX;
        break;
      case 'right':
        delta = -deltaX;
        break;
      case 'top':
        delta = deltaY;
        break;
      case 'bottom':
        delta = -deltaY;
        break;
    }

    const newSize = Math.max(
      this.minSize(),
      Math.min(this.maxSize(), this.dragStart.size + delta)
    );

    this.currentSize.set(newSize);
    this.emitSizeChange(delta);
  }

  private onMouseUp(): void {
    this.finishResize();
  }

  private onTouchEnd(): void {
    this.finishResize();
  }

  private finishResize(): void {
    this.isResizing.set(false);
    this.removeGlobalListeners();
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    this.emitSizeChange(0, false);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  // Keyboard resize
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.resizable() || !this.isExpanded() || !event.shiftKey) return;

    const step = 10;
    let delta = 0;

    switch (event.key) {
      case 'ArrowLeft':
        delta = this.side() === 'right' ? step : -step;
        break;
      case 'ArrowRight':
        delta = this.side() === 'right' ? -step : step;
        break;
      case 'ArrowUp':
        delta = this.side() === 'bottom' ? step : -step;
        break;
      case 'ArrowDown':
        delta = this.side() === 'bottom' ? -step : step;
        break;
      default:
        return;
    }

    event.preventDefault();
    const newSize = Math.max(
      this.minSize(),
      Math.min(this.maxSize(), this.currentSize() + delta)
    );

    this.currentSize.set(newSize);
    this.emitSizeChange(delta, false);
  }

  // Template helper methods
  trackByTabId(index: number, tab: DockingPanelTab): string {
    return tab.id;
  }

  getTooltipPosition(): 'above' | 'below' | 'left' | 'right' {
    switch (this.side()) {
      case 'left': return 'right';
      case 'right': return 'left';
      case 'top': return 'below';
      case 'bottom': return 'above';
      default: return 'right';
    }
  }

  getMainContentStyle(): string {
  if (this.layoutManaged) return '';
  if (!this.isPushMode() || !this.isExpanded()) return '';

    const size = this.currentSize();
    switch (this.side()) {
      case 'left':
        return `margin-left: ${size}px`;
      case 'right':
        return `margin-right: ${size}px`;
      case 'top':
        return `margin-top: ${size}px`;
      case 'bottom':
        return `margin-bottom: ${size}px`;
      default:
        return '';
    }
  }

  // Event emission
  private emitTabChange(index: number, previousIndex: number): void {
    const allTabs = this.allTabs();
    if (index >= 0 && index < allTabs.length) {
      const tab = allTabs[index];
      this.tabChange.emit({ index, tab, previousIndex });
    }
  }

  private emitStateChange(): void {
    this.stateChange.emit({
      expanded: this.isExpanded(),
      activeTabIndex: this.activeTabIndex(),
      size: this.currentSize(),
      side: this.side()
    });
  }

  private emitSizeChange(delta: number, isResizing: boolean = true): void {
    this.sizeChange.emit({
      size: this.currentSize(),
      side: this.side(),
      isResizing,
      delta
    });
  }
}
