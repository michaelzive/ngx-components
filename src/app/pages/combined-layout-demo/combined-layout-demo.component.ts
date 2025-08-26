import { Component, signal } from '@angular/core';
import { DockingPanelComponent, DockingLayoutComponent, DockingPanelTabDirective } from '../../components/docking-panel';
import { SplitterComponent, SplitterPanelComponent } from '../../components/splitter';

@Component({
  selector: 'app-combined-layout-demo',
  templateUrl: './combined-layout-demo.component.html',
  styleUrls: ['./combined-layout-demo.component.scss'],
  imports: [DockingPanelComponent, DockingLayoutComponent, DockingPanelTabDirective, SplitterComponent, SplitterPanelComponent],
})
export class CombinedLayoutDemoComponent {
  // Panel sizes for the main horizontal splitter (Design Canvas | Preview & Code)
  mainPanelSizes = signal<[number, number]>([50, 50]);
  
  // Active tab states for each docking panel
  activeTopTab = signal('Properties');
  activeLeftTab = signal('Explorer');
  activeRightTab = signal('Details');
  activeBottomTab = signal('Console');
  
  
  onMainSizeChange(sizes: [number, number]) {
    this.mainPanelSizes.set(sizes);
  }
}