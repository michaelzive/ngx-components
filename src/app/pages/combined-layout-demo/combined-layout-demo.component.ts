import { Component } from '@angular/core';
import { DockingPanelComponent } from '../../components/docking-panel';
import { SplitterComponent, SplitterPanelComponent } from '../../components/splitter';

@Component({
  selector: 'app-combined-layout-demo',
  templateUrl: './combined-layout-demo.component.html',
  styleUrls: ['./combined-layout-demo.component.scss'],
  imports: [DockingPanelComponent, SplitterComponent, SplitterPanelComponent],
})
export class CombinedLayoutDemoComponent {
  // Logic for integrating docking panel and splitter components can be added here
  topSize = 50;
}