import { Component } from '@angular/core';
import { DockingPanelDemoComponent } from './components/docking-panel/docking-panel-demo.component';
import { SplitterComponent } from './components/splitter/splitter.component';
import { SplitterPanelComponent } from './components/splitter/splitter-panel.component';

@Component({
  selector: 'app-sample-usage',
  standalone: true,
  imports: [DockingPanelDemoComponent, SplitterComponent, SplitterPanelComponent],
  template: `
    <div style="padding:16px 0; display: grid; gap: 24px;">
      <section>
        <h3>Docking Panel Demo</h3>
        <app-docking-panel-demo></app-docking-panel-demo>
      </section>

      <section style="height: 300px; border: 1px solid #eee;">
        <h3>Splitter Demo (Horizontal, Nested)</h3>
        <app-splitter [panelSizes]="[35,65]" (sizesChange)="onSizes($event)">
          <app-splitter-panel ariaLabel="Navigation">
            <div style="padding:8px;">Left panel (35%)</div>
          </app-splitter-panel>
          <app-splitter-panel ariaLabel="Content">
            <div style="height:100%;">
              <app-splitter [layout]="'vertical'" [panelSizes]="[60,40]">
                <app-splitter-panel ariaLabel="Top">
                  <div style="padding:8px;">Top (60%)</div>
                </app-splitter-panel>
                <app-splitter-panel ariaLabel="Bottom">
                  <div style="padding:8px;">Bottom (40%)</div>
                </app-splitter-panel>
              </app-splitter>
            </div>
          </app-splitter-panel>
        </app-splitter>
      </section>
    </div>
  `
})
export class SampleUsageComponent {
  onSizes(_sizes: [number, number]) {}
}
