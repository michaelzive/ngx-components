import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'docking-panel-demo',
		loadComponent: () => import('./components/docking-panel/docking-panel-demo.component').then(m => m.DockingPanelDemoComponent)
	},
  {
    path: 'multiple-docking-panel-demo',
    loadComponent: () => import('./components/docking-panel/docking-multipanel-demo.component').then(m => m.DockingMultiPanelDemoComponent)
  },
  {
	path: 'sample-usage',
	loadComponent: () => import('./sample-usage.component').then(m => m.SampleUsageComponent)
  },
	// Legacy path retained as redirect for backward compatibility
	{ path: '', pathMatch: 'full', redirectTo: 'sample-usage' }
];
