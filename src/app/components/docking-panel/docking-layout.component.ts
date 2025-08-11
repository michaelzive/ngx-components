import { Component, ContentChildren, QueryList, AfterContentInit, signal, computed, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DockingPanelComponent } from './docking-panel.component';
import { DockingSide } from './docking-panel.interfaces';

interface PanelStateSnapshot {
  side: DockingSide;
  expanded: boolean;
  size: number;
  collapsedSize: number;
  mode: string;
}

@Component({
  selector: 'app-docking-layout',
  standalone: true,
  imports: [CommonModule],
  host: { '[style.--docking-panel-cross-axis-transition]': 'crossAxisTransition' },
  template: `
    <div class="docking-layout-wrapper">
      <ng-content select="app-docking-panel"></ng-content>
      <div class="docking-layout-main" [style.margin]="aggregateMarginStyle()">
        <ng-content select="*:not(app-docking-panel)"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { position: relative; display: block; width:100%; height:100%; }
  .docking-layout-wrapper { position: relative; width:100%; height:100%; }
  .docking-layout-main { position: relative; width:100%; height:100%; box-sizing: border-box; transition: margin 250ms ease-out; }
  `]
})
export class DockingLayoutComponent implements AfterContentInit, OnDestroy, OnChanges {
  @ContentChildren(DockingPanelComponent) panels!: QueryList<DockingPanelComponent>;
  @Input() includeCollapsedStripInOffset = true; // whether collapsedSize contributes to push margin
  @Input() globalAnchored = false; // when true, panels are fixed to viewport instead of container
  @Input() manageCrossAxisClearance = true; // shift orthogonal panels so tab bars remain visible
  @Input() crossAxisTransition = '250ms ease';
  // When panels are globally anchored (fixed) you may not want to reserve their full expanded size.
  // Options:
  //  - 'full': (default) reserve full expanded size (current behavior)
  //  - 'collapsed': always reserve only collapsed strip thickness even when expanded
  //  - 'none': reserve nothing (content flows under panel)
  @Input() globalAnchoredPushMode: 'full' | 'collapsed' | 'none' = 'full';

  private readonly panelsSignal = signal<PanelStateSnapshot[]>([]);

  readonly aggregateOffsets = computed(() => {
    const left = this.sumForSide('left');
    const right = this.sumForSide('right');
    const top = this.sumForSide('top');
    const bottom = this.sumForSide('bottom');
    return { top, right, bottom, left };
  });

  readonly aggregateMarginStyle = computed(() => {
    const o = this.aggregateOffsets();
    return `${o.top}px ${o.right}px ${o.bottom}px ${o.left}px`;
  });

  ngAfterContentInit(): void {
    this.capturePanelStates();
    // Mark panels as layout-managed
    this.panels.forEach(p => {
      (p as any).layoutManaged = true;
      (p as any).globalAnchored = this.globalAnchored;
    });
  this.applyCrossAxisOffsets();

    // Listen to panel output events to refresh snapshot (avoid effect() outside injection ctx)
    this.panels.forEach(panel => {
      const update = () => {
        const snap: PanelStateSnapshot = {
          side: panel.side(),
          expanded: panel.isExpanded(),
          size: panel.currentSize(),
          collapsedSize: panel.collapsedSize(),
          mode: panel.mode()
        };
        this.updatePanel(panel, snap);
  this.applyCrossAxisOffsets();
      };
      // Store subscriptions for cleanup
      const subs: any[] = [];
      subs.push(panel.stateChange.subscribe(update));
      subs.push(panel.sizeChange.subscribe(update));
      // Initial capture
      update();
      (panel as any).__layoutSubs = subs;
    });

    this.panels.changes.subscribe(() => {
      this.panels.forEach(p => {
        (p as any).layoutManaged = true;
        (p as any).globalAnchored = this.globalAnchored;
      });
      this.capturePanelStates();
  this.applyCrossAxisOffsets();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['globalAnchored'] && this.panels) {
      this.panels.forEach(p => (p as any).globalAnchored = this.globalAnchored);
    }
    if (changes['manageCrossAxisClearance']) {
      this.applyCrossAxisOffsets();
    }
  }

  private applyCrossAxisOffsets() {
    if (!this.manageCrossAxisClearance || !this.panels) return;
    const offsets = this.aggregateOffsets();
    this.panels.forEach(panel => {
      const side = panel.side();
      let top = 0, bottom = 0, left = 0, right = 0;
      if (side === 'left' || side === 'right') {
        top = offsets.top;
        bottom = offsets.bottom;
      } else if (side === 'top' || side === 'bottom') {
        left = offsets.left;
        right = offsets.right;
      }
      (panel as any).setCrossAxisOffsets?.({ top, bottom, left, right });
    });
  }

  private updatePanel(panel: DockingPanelComponent, snap: PanelStateSnapshot) {
    const current = this.panelsSignal();
    const idx = current.findIndex(s => s === (panel as any).__snapRef);
    if (idx >= 0) {
      const clone = [...current];
      clone[idx] = snap;
      (panel as any).__snapRef = snap;
      this.panelsSignal.set(clone);
    } else {
      (panel as any).__snapRef = snap;
      this.panelsSignal.set([...current, snap]);
    }
  }

  ngOnDestroy(): void {
    this.panels?.forEach(p => {
      const subs: any[] = (p as any).__layoutSubs;
      subs?.forEach(s => s.unsubscribe?.());
    });
  }

  private capturePanelStates() {
    const snaps: PanelStateSnapshot[] = this.panels.map(p => ({
      side: p.side(),
      expanded: p.isExpanded(),
      size: p.currentSize(),
      collapsedSize: p.collapsedSize(),
      mode: p.mode()
    }));
    this.panels.forEach((p,i)=> (p as any).__snapRef = snaps[i]);
    this.panelsSignal.set(snaps);
  }

  private sumForSide(side: DockingSide): number {
    return this.panelsSignal()
      .filter(p => p.side === side && p.mode === 'push')
      .reduce((acc, p) => {
        const anchored = this.globalAnchored;
        if (anchored) {
          switch (this.globalAnchoredPushMode) {
            case 'none':
              return acc; // never push
            case 'collapsed':
              // always reserve collapsed thickness if configured to include it
              return acc + (this.includeCollapsedStripInOffset ? p.collapsedSize : 0);
            case 'full':
            default:
              // fall through to normal logic
              break;
          }
        }
        if (p.expanded) return acc + p.size;
        if (this.includeCollapsedStripInOffset) return acc + p.collapsedSize;
        return acc;
      }, 0);
  }
}
