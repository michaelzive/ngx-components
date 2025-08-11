import { Component } from '@angular/core';

import { DockingPanelDemoComponent } from './components/docking-panel/docking-panel-demo.component';

@Component({
  selector: 'app-sample-usage',
  standalone: true,
  imports: [DockingPanelDemoComponent],
  template: `
    <div style="padding:16px 0;">
      <app-docking-panel-demo></app-docking-panel-demo>
    </div>
  `
})
export class SampleUsageComponent {
}
