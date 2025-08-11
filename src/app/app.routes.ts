import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'docking-panel-demo',
		loadComponent: () => import('./components/docking-panel/docking-panel-demo.component').then(m => m.DockingPanelDemoComponent)
	},
	// Legacy path retained as redirect for backward compatibility
	{ path: 'drawer-panel-demo', pathMatch: 'full', redirectTo: 'docking-panel-demo' },
	{ path: '', pathMatch: 'full', redirectTo: 'docking-panel-demo' }
];
