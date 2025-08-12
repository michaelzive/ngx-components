import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Output,
  HostBinding,
  HostListener,
  QueryList,
  Renderer2,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SplitterPanelComponent } from './splitter-panel.component'; 

export type SplitterLayout = 'horizontal' | 'vertical';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function normalizeSizes(
  sizes: [number, number] | undefined,
  min: [number, number]
): [number, number] {
  const def: [number, number] = [50, 50];
  let [a, b] = sizes ?? def;
  // Ensure non-negative
  a = Number.isFinite(a) ? a : def[0];
  b = Number.isFinite(b) ? b : def[1];
  if (a < 0 || b < 0) {
    [a, b] = def;
  }
  const sum = a + b;
  if (sum <= 0) {
    [a, b] = def;
  } else if (sum !== 100) {
    a = (a / sum) * 100;
    b = 100 - a;
  }
  const min0 = clamp(min[0], 0, 100);
  const min1 = clamp(min[1], 0, 100 - min0);
  a = clamp(a, min0, 100 - min1);
  b = 100 - a;
  // Round to 3 decimals to avoid floating drift
  a = Math.round(a * 1000) / 1000;
  b = Math.round(b * 1000) / 1000;
  return [a, b];
}

@Component({
  selector: 'app-splitter',
  standalone: true,
  imports: [CommonModule, NgClass],
  template: `
    <div
      class="splitter-root"
      role="group"
      [attr.data-layout]="layout()"
    >
      <ng-content select="app-splitter-panel"></ng-content>

      @if (!disabled() && hasTwoPanels()) {
        <div
          class="splitter-handle"
          [attr.role]="'separator'"
          [attr.aria-orientation]="ariaOrientation()"
          [attr.aria-label]="'Resize panels'"
          [attr.aria-controls]="ariaControls()"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="100"
          [attr.aria-valuenow]="firstSizeRounded()"
          [attr.aria-valuetext]="firstSizeText()"
          tabindex="0"
          [ngClass]="{
            horizontal: isHorizontal(),
            vertical: isVertical(),
            dragging: dragging()
          }"
          (pointerdown)="onHandlePointerDown($event)"
          (keydown)="onHandleKeyDown($event)"
          [style.left.%]="isHorizontal() ? sizes()[0] : null"
          [style.top.%]="isVertical() ? sizes()[0] : null"
        ></div>
      }

      <div class="sr-only" aria-live="polite">First panel {{ firstSizeRounded() }}%</div>
    </div>
  `,
  styleUrls: ['./splitter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterComponent implements AfterContentInit {
  // Inputs
  layout = input<SplitterLayout>('horizontal');
  panelSizes = input<[number, number] | undefined>(undefined);
  minSizes = input<[number, number]>([10, 10]);
  step = input<number>(2);
  largeStep = input<number>(10);
  disabled = input<boolean>(false);

  // Outputs
  @Output() readonly sizesChange = new EventEmitter<[number, number]>();

  // Content children (exactly two required)
  @ContentChildren(SplitterPanelComponent) panels!: QueryList<SplitterPanelComponent>;

  // Internal state signals
  private readonly _sizes = signal<[number, number]>([50, 50]); // percent
  sizes = this._sizes.asReadonly();

  private readonly _dragging = signal<boolean>(false);
  dragging = this._dragging.asReadonly();

  // Cached data during drag
  private _containerRect: DOMRect | null = null;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _startSizes: [number, number] = [50, 50];
  private _raf = 0;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  // Derived
  readonly isHorizontal = computed(() => this.layout() === 'horizontal');
  readonly isVertical = computed(() => this.layout() === 'vertical');

  readonly firstSizeRounded = computed(() => Math.round(this.sizes()[0]));
  readonly firstSizeText = computed(() => `${this.firstSizeRounded()}%`);
  readonly ariaOrientation = computed(() => (this.isHorizontal() ? 'horizontal' : 'vertical'));

  readonly ariaControls = computed(() => {
    const ids = this.panels?.map(p => p.id()) ?? [];
    return ids.join(' ');
  });

  private _resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Keep child panel styles in sync with sizes and layout
    effect(() => {
      const sizes = this.sizes();
      const [a, b] = sizes;
      const min = this.minSizes();
      const horizontal = this.isHorizontal();

      if (!this.panels) return;
      const arr = this.panels.toArray();
      if (arr.length !== 2) return;

      const [p0, p1] = arr;
      // Apply basis and min constraints
      this.applyPanelStyles(p0.elementRef.nativeElement, a, min[0], horizontal);
      this.applyPanelStyles(p1.elementRef.nativeElement, b, min[1], horizontal);
    });

    // When inputs change (panelSizes or minSizes), normalize sizes
    effect(() => {
      const sizes = this.panelSizes();
      const min = this.minSizes();
      const normalized = normalizeSizes(sizes, min);
      this._sizes.set(normalized);
    });
  }

  ngAfterContentInit(): void {
    // Ensure exactly two panels
    if (this.panels.length !== 2) {
      throw new Error('app-splitter requires exactly two <app-splitter-panel> children.');
    }

    // Initial apply (effect will run as well)
    const normalized = normalizeSizes(this.panelSizes(), this.minSizes());
    this._sizes.set(normalized);

    // Observe container resize (rely on percentages for layout; no percentage change)
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        // no-op; percentages handle layout; keep for potential future features
        // Could be used to refresh cached rects on next drag start
      });
      this._resizeObserver.observe(this.host.nativeElement);
    }
  }

  // Public API
  reset(): void {
    this._sizes.set(normalizeSizes(this.panelSizes(), this.minSizes()));
  }

  hasTwoPanels(): boolean {
    return !!this.panels && this.panels.length === 2;
  }

  private applyPanelStyles(el: HTMLElement, basisPercent: number, minPercent: number, horizontal: boolean): void {
    // Panels behave as fixed-basis flex items controlled by percentages
    this.renderer.setStyle(el, 'flex', '0 0 auto');
    this.renderer.setStyle(el, 'flex-basis', `${basisPercent}%`);
    if (horizontal) {
      this.renderer.setStyle(el, 'min-width', `${minPercent}%`);
      this.renderer.removeStyle(el, 'min-height');
    } else {
      this.renderer.setStyle(el, 'min-height', `${minPercent}%`);
      this.renderer.removeStyle(el, 'min-width');
    }
  }

  private getRtl(): boolean {
    // Detect RTL from host or computed style
    const attr = this.host.nativeElement.getAttribute('dir');
    if (attr) return attr.toLowerCase() === 'rtl';
    const style = globalThis.getComputedStyle?.(this.host.nativeElement);
    return style?.direction === 'rtl';
  }

  onHandlePointerDown(event: PointerEvent): void {
    if (this.disabled()) return;
    const el = this.host.nativeElement;
    (event.target as Element)?.setPointerCapture?.(event.pointerId);

    this._containerRect = el.getBoundingClientRect();
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    this._startSizes = [...this.sizes()] as [number, number];
    this._dragging.set(true);

    const move = (e: PointerEvent) => this.onGlobalPointerMove(e);
    const up = (e: PointerEvent) => this.onGlobalPointerUp(e, move, up);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  }

  private onGlobalPointerMove(event: PointerEvent): void {
    if (this.disabled() || !this._containerRect) return;

    const horizontal = this.isHorizontal();
    const rtl = this.getRtl();

    const dx = event.clientX - this._dragStartX;
    const dy = event.clientY - this._dragStartY;

    const total = horizontal ? this._containerRect.width : this._containerRect.height;
    const deltaPx = horizontal ? dx : dy;

    const signed = horizontal && rtl ? -deltaPx : deltaPx;
    const deltaPercent = (signed / (total || 1)) * 100;

    const min = this.minSizes();
    let first = this._startSizes[0] + deltaPercent;
    first = clamp(first, clamp(min[0], 0, 100), 100 - clamp(min[1], 0, 100));
    const next: [number, number] = [Math.round(first * 1000) / 1000, Math.round((100 - first) * 1000) / 1000];

    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this._sizes.set(next);
      this.sizesChange.emit(next);
    });
  }

  private onGlobalPointerUp(_event: PointerEvent, move: (e: PointerEvent) => void, up: (e: PointerEvent) => void): void {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up as any);
    this._containerRect = null;
    this._dragging.set(false);
  }

  onHandleKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const key = event.key;
    const horizontal = this.isHorizontal();
    const rtl = this.getRtl();
    const min = this.minSizes();
    const step = (event.ctrlKey || event.altKey || event.shiftKey) ? this.largeStep() : this.step();

    let handled = false;
    let first = this.sizes()[0];

    switch (key) {
      case 'ArrowLeft':
        if (horizontal) {
          first += rtl ? step : -step;
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (horizontal) {
          first += rtl ? -step : step;
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (!horizontal) {
          first += -step;
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (!horizontal) {
          first += step;
          handled = true;
        }
        break;
      case 'Home': {
        first = clamp(min[0], 0, 100);
        handled = true;
        break;
      }
      case 'End': {
        first = 100 - clamp(min[1], 0, 100);
        handled = true;
        break;
      }
    }

    if (handled) {
      event.preventDefault();
      first = clamp(first, clamp(min[0], 0, 100), 100 - clamp(min[1], 0, 100));
      const next: [number, number] = [Math.round(first * 1000) / 1000, Math.round((100 - first) * 1000) / 1000];
      this._sizes.set(next);
      this.sizesChange.emit(next);
    }
  }

  @HostBinding('class.app-splitter') hostClass = true;
  @HostBinding('attr.data-layout') get dataLayout(): SplitterLayout { return this.layout(); }

  @HostListener('window:mouseup') onMouseUpWindow() {
    // Safety: end drag if pointerup missed
    if (this.dragging()) {
      this._dragging.set(false);
      this._containerRect = null;
    }
  }

  ngOnDestroy(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
