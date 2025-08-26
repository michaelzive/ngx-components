import { Component, AfterContentInit, signal, computed, OnDestroy, ContentChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DockingPanelComponent } from './docking-panel.component';

@Component({
  selector: 'app-docking-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="docking-layout-grid" [class]="computedGridClass()">
      <!-- Top panel slot -->
      <div class="grid-area-top">
        <ng-content select="app-docking-panel[slot='top']"></ng-content>
      </div>
      
      <!-- Left panel slot -->
      <div class="grid-area-left">
        <ng-content select="app-docking-panel[slot='left']"></ng-content>
      </div>
      
      <!-- Main content slot -->
      <div class="grid-area-main">
        <ng-content select="[slot='main'], :not(app-docking-panel):not([slot])"></ng-content>
      </div>
      
      <!-- Right panel slot -->
      <div class="grid-area-right">
        <ng-content select="app-docking-panel[slot='right']"></ng-content>
      </div>
      
      <!-- Bottom panel slot -->
      <div class="grid-area-bottom">
        <ng-content select="app-docking-panel[slot='bottom']"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .docking-layout-grid {
      display: grid;
      width: 100%;
      height: 100%;
      grid-template-areas: 
        "top-panel    top-panel    top-panel"
        "left-panel  main-content right-panel"
        "bottom-panel bottom-panel bottom-panel";
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto 1fr auto;
      gap: 0;
    }
    
    .grid-area-top { grid-area: top-panel; }
    .grid-area-left { grid-area: left-panel; }
    .grid-area-main { grid-area: main-content; overflow: hidden; }
    .grid-area-right { grid-area: right-panel; }
    .grid-area-bottom { grid-area: bottom-panel; }
    
    /* Hide empty grid areas */
    .grid-area-top:empty { display: none; }
    .grid-area-left:empty { display: none; }
    .grid-area-right:empty { display: none; }
    .grid-area-bottom:empty { display: none; }
    
    /* Dynamic grid templates based on content */
    .no-top {
      grid-template-areas: 
        "left-panel  main-content right-panel"
        "bottom-panel bottom-panel bottom-panel";
      grid-template-rows: 1fr auto;
    }
    
    .no-bottom {
      grid-template-areas: 
        "top-panel    top-panel    top-panel"
        "left-panel  main-content right-panel";
      grid-template-rows: auto 1fr;
    }
    
    .no-left {
      grid-template-areas: 
        "top-panel    top-panel"
        "main-content right-panel"
        "bottom-panel bottom-panel";
      grid-template-columns: 1fr auto;
    }
    
    .no-right {
      grid-template-areas: 
        "top-panel    top-panel"
        "left-panel  main-content"
        "bottom-panel bottom-panel";
      grid-template-columns: auto 1fr;
    }
    
    .no-top.no-bottom {
      grid-template-areas: "left-panel  main-content right-panel";
      grid-template-rows: 1fr;
    }
    
    .no-left.no-right {
      grid-template-areas: 
        "top-panel"
        "main-content"
        "bottom-panel";
      grid-template-columns: 1fr;
    }
    
    .no-top.no-left {
      grid-template-areas: 
        "main-content right-panel"
        "bottom-panel bottom-panel";
      grid-template-columns: 1fr auto;
      grid-template-rows: 1fr auto;
    }
    
    .no-top.no-right {
      grid-template-areas: 
        "left-panel  main-content"
        "bottom-panel bottom-panel";
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr auto;
    }
    
    .no-bottom.no-left {
      grid-template-areas: 
        "top-panel    top-panel"
        "main-content right-panel";
      grid-template-columns: 1fr auto;
      grid-template-rows: auto 1fr;
    }
    
    .no-bottom.no-right {
      grid-template-areas: 
        "top-panel    top-panel"
        "left-panel  main-content";
      grid-template-columns: auto 1fr;
      grid-template-rows: auto 1fr;
    }
    
    .no-top.no-bottom.no-left {
      grid-template-areas: "main-content right-panel";
      grid-template-columns: 1fr auto;
      grid-template-rows: 1fr;
    }
    
    .no-top.no-bottom.no-right {
      grid-template-areas: "left-panel main-content";
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr;
    }
    
    .no-left.no-right.no-top {
      grid-template-areas: 
        "main-content"
        "bottom-panel";
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }
    
    .no-left.no-right.no-bottom {
      grid-template-areas: 
        "top-panel"
        "main-content";
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    
    .no-panels {
      grid-template-areas: "main-content";
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }
  `]
})
export class DockingLayoutComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(DockingPanelComponent) panels!: QueryList<DockingPanelComponent>;
  
  private readonly hasTop = signal(false);
  private readonly hasLeft = signal(false);
  private readonly hasRight = signal(false);
  private readonly hasBottom = signal(false);

  readonly computedGridClass = computed(() => {
    const classes = [];
    if (!this.hasTop()) classes.push('no-top');
    if (!this.hasLeft()) classes.push('no-left');
    if (!this.hasRight()) classes.push('no-right');
    if (!this.hasBottom()) classes.push('no-bottom');
    
    if (classes.length === 4) {
      return 'no-panels';
    }
    
    return classes.join(' ');
  });

  ngAfterContentInit(): void {
    // Initial panel detection
    this.updatePanelStates();
    
    // Listen for changes to panel list
    this.panels.changes.subscribe(() => {
      this.updatePanelStates();
    });
  }

  ngOnDestroy(): void {
    // Clean up is handled automatically by Angular
  }

  private updatePanelStates(): void {
    // Use ContentChildren to detect panels by their slot attribute
    const panelArray = this.panels?.toArray() || [];
    
    this.hasTop.set(panelArray.some(panel => panel.side() === 'top'));
    this.hasLeft.set(panelArray.some(panel => panel.side() === 'left'));
    this.hasRight.set(panelArray.some(panel => panel.side() === 'right'));
    this.hasBottom.set(panelArray.some(panel => panel.side() === 'bottom'));
  }
}
