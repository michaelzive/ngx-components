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
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  DrawerDock,
  DrawerMode,
  DrawerPanelTab,
  DrawerPanelTabChangeEvent,
  DrawerPanelResizeEvent,
  DEFAULT_DRAWER_PANEL_CONFIG
} from './drawer-panel.interfaces';
import { DrawerPanelTabDirective } from './drawer-panel-tab.directive';

@Component({
  selector: 'app-drawer-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './drawer-panel.component.html',
  styleUrl: './drawer-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('tabIndicator', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DrawerPanelComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  // Inputs as signals
  readonly dock = input<DrawerDock>(DEFAULT_DRAWER_PANEL_CONFIG.dock);
  readonly mode = input<DrawerMode>(DEFAULT_DRAWER_PANEL_CONFIG.mode);
  readonly hasBackdrop = input<boolean>(DEFAULT_DRAWER_PANEL_CONFIG.hasBackdrop);
  readonly initialSize = input<number>(DEFAULT_DRAWER_PANEL_CONFIG.initialSize);
  readonly minSize = input<number>(DEFAULT_DRAWER_PANEL_CONFIG.minSize);
  readonly maxSize = input<number>(DEFAULT_DRAWER_PANEL_CONFIG.maxSize);
  readonly collapsedThickness = input<number>(DEFAULT_DRAWER_PANEL_CONFIG.collapsedThickness);
  readonly resizable = input<boolean>(DEFAULT_DRAWER_PANEL_CONFIG.resizable);
  readonly autoFocus = input<boolean>(DEFAULT_DRAWER_PANEL_CONFIG.autoFocus);
  readonly tabsInput = input<DrawerPanelTab[]>([]); // programmatic tabs
  // Visual variant: 'default' | 'ag'
  readonly variant = input<'default' | 'ag'>('default');

  // Outputs
  readonly tabChange = output<DrawerPanelTabChangeEvent>();
  readonly expandedChange = output<boolean>();
  readonly sizeChange = output<DrawerPanelResizeEvent>();

  // Template references
  @ContentChildren(DrawerPanelTabDirective) projectedTabs!: QueryList<DrawerPanelTabDirective>;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>;

  // Internal state signals
  readonly isExpanded = signal<boolean>(false);
  readonly activeIndex = signal<number>(0);
  readonly panelSize = signal<number>(this.initialSize());
  readonly isResizing = signal<boolean>(false);

  // Computed
  readonly isHorizontal = computed(() => this.dock() === 'top' || this.dock() === 'bottom');
  readonly isVertical = computed(() => !this.isHorizontal());
  readonly drawerPosition = computed(() => (this.dock() === 'left' || this.dock() === 'top') ? 'start' : 'end');
  readonly isAgVariant = computed(() => this.variant() === 'ag');

  private readonly projected = signal<DrawerPanelTab[]>([]);
  readonly allTabs = computed(() => {
    const combined = [...this.projected(), ...this.tabsInput()];
    return combined.filter(t => !t.disabled);
  });

  readonly currentTab = computed(() => this.allTabs()[this.activeIndex()] ?? null);

  // Resize tracking
  private dragStartSize = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragging = false;
  private boundMove = (e: MouseEvent) => this.onGlobalMove(e);
  private boundUp = () => this.onGlobalUp();

  ngAfterContentInit(): void {
    this.captureProjectedTabs();
    this.projectedTabs.changes.subscribe(() => this.captureProjectedTabs());

    if (this.autoFocus() && this.allTabs().length) {
      queueMicrotask(() => this.expand());
    }
  }

  ngAfterViewInit(): void {
    // Keep the sidenav logically "open" even while collapsed so the collapsedThickness gutter is always present.
    // We don't rely on mat-sidenav open/close to represent expanded state anymore; instead we drive size via binding.
    queueMicrotask(() => {
      this.sidenav?.open();
    });
  }

  ngOnDestroy(): void {
    this.detachGlobalListeners();
  }

  private captureProjectedTabs(): void {
    const tabs: DrawerPanelTab[] = this.projectedTabs?.map(d => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      disabled: d.disabled,
      content: d.template,
      data: d.data,
      ariaLabel: d.ariaLabel || d.label
    })) ?? [];
    this.projected.set(tabs);
  }

  // Interaction
  onTabLabelClick(index: number): void {
    if (this.activeIndex() === index && this.isExpanded()) {
      this.collapse();
      return;
    }
    this.activeIndex.set(index);
    if (!this.isExpanded()) this.expand();
    this.emitTabChange();
  }

  onTabGroupIndexChange(i: number): void {
    if (this.activeIndex() !== i) {
      this.activeIndex.set(i);
      this.emitTabChange();
    }
  }

  onTabStripKeydown(ev: KeyboardEvent): void {
    const key = ev.key;
    const horizontal = this.isVertical(); // tab strip orientation swaps when docked vertically (labels stack vertically)
    const max = this.allTabs().length - 1;
    const move = (dir: 1 | -1) => {
      let idx = this.activeIndex();
      for (let i = 0; i < this.allTabs().length; i++) { // prevent infinite loop
        idx = (idx + dir + this.allTabs().length) % this.allTabs().length;
        if (!this.allTabs()[idx].disabled) { this.activeIndex.set(idx); break; }
      }
    };
    switch (key) {
      case 'ArrowLeft':
        if (this.dock() === 'top' || this.dock() === 'bottom') { move(-1); ev.preventDefault(); }
        break;
      case 'ArrowRight':
        if (this.dock() === 'top' || this.dock() === 'bottom') { move(1); ev.preventDefault(); }
        break;
      case 'ArrowUp':
        if (this.dock() === 'left' || this.dock() === 'right') { move(-1); ev.preventDefault(); }
        break;
      case 'ArrowDown':
        if (this.dock() === 'left' || this.dock() === 'right') { move(1); ev.preventDefault(); }
        break;
      case 'Home':
        this.activeIndex.set(0); ev.preventDefault(); break;
      case 'End':
        this.activeIndex.set(max); ev.preventDefault(); break;
      case 'Enter':
      case ' ': // Space
        this.onTabLabelClick(this.activeIndex()); ev.preventDefault(); break;
      case 'Escape':
        if (this.isExpanded()) { this.collapse(); ev.preventDefault(); }
        break;
    }
  }

  expand(): void {
    if (this.isExpanded()) return;
    this.isExpanded.set(true);
    // Sidenav already open; just emit expanded state.
    this.expandedChange.emit(true);
  }

  collapse(): void {
    if (!this.isExpanded()) return;
    this.isExpanded.set(false);
    // Keep sidenav open (narrow gutter) instead of closing.
    this.expandedChange.emit(false);
  }

  toggle(): void { this.isExpanded() ? this.collapse() : this.expand(); }

  private emitTabChange(): void {
    const tab = this.currentTab();
    if (tab) this.tabChange.emit({ index: this.activeIndex(), tab });
  }

  // Resizing
  onResizeStart(ev: MouseEvent | TouchEvent): void {
    if (!this.resizable() || !this.isExpanded()) return;
    ev.preventDefault();
    this.dragging = true;
    this.isResizing.set(true);
    this.dragStartSize = this.panelSize();
    if (ev instanceof MouseEvent) {
      this.dragStartX = ev.clientX; this.dragStartY = ev.clientY;
    } else {
      this.dragStartX = ev.touches[0].clientX; this.dragStartY = ev.touches[0].clientY;
    }
    document.addEventListener('mousemove', this.boundMove);
    document.addEventListener('mouseup', this.boundUp);
    document.addEventListener('touchmove', this.boundMove as any, { passive: false });
    document.addEventListener('touchend', this.boundUp);
    document.body.style.userSelect = 'none';
  }

  private onGlobalMove(ev: MouseEvent): void {
    if (!this.dragging) return;
    const dx = ev.clientX - this.dragStartX;
    const dy = ev.clientY - this.dragStartY;
    let newSize = this.dragStartSize;
    switch (this.dock()) {
      case 'left': newSize = this.dragStartSize + dx; break;
      case 'right': newSize = this.dragStartSize - dx; break;
      case 'top': newSize = this.dragStartSize + dy; break;
      case 'bottom': newSize = this.dragStartSize - dy; break;
    }
    newSize = Math.max(this.minSize(), Math.min(this.maxSize(), newSize));
    this.panelSize.set(newSize);
    this.sizeChange.emit({ size: newSize, dock: this.dock(), isResizing: true });
  }

  private onGlobalUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.isResizing.set(false);
    this.sizeChange.emit({ size: this.panelSize(), dock: this.dock(), isResizing: false });
    this.detachGlobalListeners();
  }

  private detachGlobalListeners(): void {
    document.removeEventListener('mousemove', this.boundMove);
    document.removeEventListener('mouseup', this.boundUp);
    document.removeEventListener('touchmove', this.boundMove as any);
    document.removeEventListener('touchend', this.boundUp);
    document.body.style.userSelect = '';
  }

  // Accessibility helpers
  onKeyResize(ev: KeyboardEvent): void {
    if (!this.resizable() || !this.isExpanded()) return;
    const step = (ev.shiftKey ? 20 : 10);
    let delta = 0;
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(ev.key)) {
      ev.preventDefault();
      switch (ev.key) {
        case 'ArrowLeft': delta = (this.dock() === 'right') ? step : -step; break;
        case 'ArrowRight': delta = (this.dock() === 'right') ? -step : step; break;
        case 'ArrowUp': delta = (this.dock() === 'bottom') ? step : -step; break;
        case 'ArrowDown': delta = (this.dock() === 'bottom') ? -step : step; break;
      }
      let newSize = this.panelSize() + (this.isVertical() ? delta : delta);
      newSize = Math.max(this.minSize(), Math.min(this.maxSize(), newSize));
      this.panelSize.set(newSize);
      this.sizeChange.emit({ size: newSize, dock: this.dock(), isResizing: false });
    }
  }
}
