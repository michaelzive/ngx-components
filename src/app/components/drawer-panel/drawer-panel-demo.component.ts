import { Component, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DrawerPanelComponent } from './drawer-panel.component';
import { DrawerPanelTab } from './drawer-panel.interfaces';
import { DrawerPanelTabDirective } from './drawer-panel-tab.directive';

@Component({
  selector: 'app-drawer-panel-demo',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatCardModule, DrawerPanelComponent, DrawerPanelTabDirective],
  template: `
    <app-drawer-panel
      [dock]="dock()"
      [mode]="mode()"
      [tabsInput]="tabs()"
      [hasBackdrop]="backdrop()"
      [initialSize]="size()"
      [resizable]="true"
      (tabChange)="onTabChange($event)"
      (expandedChange)="expanded.set($event)"
      style="height:100vh;">
    
      <div class="demo-main">
        <h1>Drawer Panel Demo</h1>
        <p>Dock: {{ dock() }} | Mode: {{ mode() }} | Expanded: {{ expanded() }}</p>
        <button mat-raised-button color="primary" (click)="addTab()">Add Tab</button>
        <button mat-stroked-button (click)="toggleDock()">Toggle Dock</button>
        <button mat-stroked-button (click)="toggleMode()">Toggle Mode</button>
        <button mat-stroked-button (click)="backdrop.set(!backdrop())">Toggle Backdrop</button>
      </div>
    
      <!-- Projected tab examples -->
      <ng-template drawerPanelTab="Info" icon="info">
        <div class="tab-body"><h2>Info</h2><p>This tab was projected via ng-template directive.</p></div>
      </ng-template>
      <ng-template drawerPanelTab="Logs" icon="list">
        <div class="tab-body"><h2>Logs</h2>@for (log of logs; track log) {
        <p>{{ log }}</p>
      }</div>
    </ng-template>
    </app-drawer-panel>
    `,
  styles: [`
    .demo-main { padding:24px; }
    .tab-body { padding:16px; }
  `]
})
export class DrawerPanelDemoComponent {
  dock = signal<'left'|'right'|'top'|'bottom'>('left');
  mode = signal<'over'|'push'>('over');
  backdrop = signal(false);
  size = signal(320);
  expanded = signal(false);
  tabs = signal<DrawerPanelTab[]>([
    { id:'settings', label:'Settings', icon:'settings', content: undefined, data:{ kind:'settings'} },
    { id:'tools', label:'Tools', icon:'build', content: undefined, data:{ kind:'tools'} }
  ]);
  logs = Array.from({length:5}).map((_,i)=>`Log entry ${i+1}`);

  addTab() {
    const idx = this.tabs().length + 1;
    this.tabs.update(t => [...t, { label: 'Dyn ' + idx, icon:'dynamic_form' }]);
  }
  toggleDock() {
    const order: any = ['left','top','right','bottom'];
    const next = order[(order.indexOf(this.dock())+1)%order.length];
    this.dock.set(next);
  }
  toggleMode() { this.mode.set(this.mode()==='over'?'push':'over'); }
  onTabChange(ev:any) { console.log('Tab change', ev); }
}
