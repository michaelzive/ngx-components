import { Routes } from '@angular/router';
import { CombinedLayoutDemoComponent } from './pages/combined-layout-demo/combined-layout-demo.component';
import { DockingMultiPanelDemoComponent, DockingPanelDemoComponent } from './components/docking-panel';
import { SampleUsageComponent } from './sample-usage.component';

export const routes: Routes = [
	{
		path: 'docking-panel-demo',
		component: DockingPanelDemoComponent
	},
  {
    path: 'multiple-docking-panel-demo',
    component: DockingMultiPanelDemoComponent
  },
  {
	path: 'sample-usage',
	component: SampleUsageComponent
  },
  { path: 'combined', component: CombinedLayoutDemoComponent },
	// Legacy path retained as redirect for backward compatibility
	{ path: '', pathMatch: 'full', redirectTo: 'sample-usage' }
];
