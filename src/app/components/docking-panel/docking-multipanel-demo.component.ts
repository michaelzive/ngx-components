import { Component, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DockingLayoutComponent } from './docking-layout.component';
import { DockingPanelComponent } from './docking-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-docking-multipanel-demo',
  standalone: true,
  imports: [
    CommonModule,
    DockingLayoutComponent,
    DockingPanelComponent,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <h2>Multi-Panel Docking Layout Demo</h2>
    <p>This demonstrates using <code>app-docking-layout</code> to coordinate multiple push-mode panels.</p>

  <!-- Add dock-debug class to enable vivid debug colors from panel SCSS -->
  <app-docking-layout class="multi-layout dock-debug" [includeCollapsedStripInOffset]="true" [globalAnchored]="true" globalAnchoredPushMode="collapsed">
      <app-docking-panel side="left" mode="push" [initialSize]="280" [collapsedSize]="48" [tabs]="leftTabs"></app-docking-panel>
      <app-docking-panel side="right" mode="push" [initialSize]="300" [collapsedSize]="48" [tabs]="rightTabs"></app-docking-panel>
      <app-docking-panel side="top" mode="push" [initialSize]="200" [collapsedSize]="40" [tabs]="topTabs"></app-docking-panel>
      <app-docking-panel side="bottom" mode="push" [initialSize]="180" [collapsedSize]="40" [tabs]="bottomTabs"></app-docking-panel>

      <div class="main-content">
        <p><strong>Main content area</strong> gets combined margins from all expanded push panels.</p>
        <p>Resize and open multiple panels; margins update live. Collapse a panel to reclaim space (collapsed strip still reserves its thickness).</p>
        <button mat-raised-button color="primary" (click)="expandAll()">Expand All</button>
        <button mat-raised-button color="accent" (click)="collapseAll()">Collapse All</button>
      </div>
    </app-docking-layout>
  `,
  styles: [`
  :host { display:block; padding:16px; }
  .multi-layout { position:relative; min-height:70vh; height:70vh; border:1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
  .main-content { padding:16px; background: rgba(255,255,0,0.15); }
  `]
})
export class DockingMultiPanelDemoComponent {
  leftTabs = [
    { id:'l-explorer', label:'Explorer', icon:'folder' },
    { id:'l-search', label:'Search', icon:'search' }
  ];
  rightTabs = [
    { id:'r-settings', label:'Settings', icon:'settings' }
  ];
  topTabs = [
    { id:'t-info', label:'Info', icon:'info' }
  ];
  bottomTabs = [
    { id:'b-output', label:'Output', icon:'terminal' }
  ];

  @ViewChildren(DockingPanelComponent) panelList!: QueryList<DockingPanelComponent>;

  private get panels(): DockingPanelComponent[] { return this.panelList?.toArray() ?? []; }

  expandAll() { this.panels.forEach(p => p.expand()); }
  collapseAll() { this.panels.forEach(p => p.collapse()); }
}
