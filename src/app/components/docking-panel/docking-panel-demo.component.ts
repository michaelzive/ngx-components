import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { DockingPanelComponent } from './docking-panel.component';
import { DockingPanelTabDirective } from './docking-panel-tab.directive';
import {
  DockingSide,
  DockingMode,
  DockingPanelTab,
  DockingPanelTabChangeEvent,
  DockingPanelStateChangeEvent,
  DockingPanelResizeEvent
} from './docking-panel.interfaces';

@Component({
  selector: 'app-docking-panel-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    DockingPanelComponent,
    DockingPanelTabDirective
  ],
  template: `
    <div class="demo-container">
      <h1>Docking Panel Interactive Demo</h1>
      <p>Explore all features of the docking panel component with live controls.</p>

      <!-- Control Panel -->
      <mat-card class="controls-card">
        <mat-card-header>
          <mat-card-title>Configuration Controls</mat-card-title>
          <mat-card-subtitle>Adjust settings to see changes in real-time</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="controls-grid">
            <!-- Dock Position -->
            <div class="control-group">
              <label>Dock Position</label>
              <mat-button-toggle-group
                [ngModel]="dockSide()"
                (ngModelChange)="dockSide.set($event); onConfigChange()"
                aria-label="Dock position">
                <mat-button-toggle value="left">
                  <mat-icon>border_left</mat-icon> Left
                </mat-button-toggle>
                <mat-button-toggle value="right">
                  <mat-icon>border_right</mat-icon> Right
                </mat-button-toggle>
                <mat-button-toggle value="top">
                  <mat-icon>border_top</mat-icon> Top
                </mat-button-toggle>
                <mat-button-toggle value="bottom">
                  <mat-icon>border_bottom</mat-icon> Bottom
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- Interaction Mode -->
            <div class="control-group">
              <label>Interaction Mode</label>
              <mat-button-toggle-group
                [ngModel]="dockMode()"
                (ngModelChange)="dockMode.set($event); onConfigChange()"
                aria-label="Interaction mode">
                <mat-button-toggle value="push">
                  <mat-icon>push_pin</mat-icon> Push
                </mat-button-toggle>
                <mat-button-toggle value="overlay">
                  <mat-icon>layers</mat-icon> Overlay
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- Size Settings -->
            <div class="control-group">
              <label>Initial Size ({{initialSize()}}px)</label>
              <mat-slider
                min="200"
                max="600"
                step="20"
                [ngModel]="initialSize()"
                (input)="onSizeSliderChange($event)"
                discrete>
                <input matSliderThumb>
              </mat-slider>
            </div>

            <!-- Animation Duration -->
            <div class="control-group">
              <label>Animation Duration ({{animationDuration()}}ms)</label>
              <mat-slider
                min="100"
                max="1000"
                step="50"
                [ngModel]="animationDuration()"
                (input)="onAnimationSliderChange($event)"
                discrete>
                <input matSliderThumb>
              </mat-slider>
            </div>

            <!-- Boolean Options -->
            <div class="control-group checkboxes">
              <mat-checkbox
                [ngModel]="hasBackdrop()"
                (ngModelChange)="hasBackdrop.set($event); onConfigChange()">
                Show Backdrop
              </mat-checkbox>
              <mat-checkbox
                [ngModel]="closeOnBackdropClick()"
                (ngModelChange)="closeOnBackdropClick.set($event); onConfigChange()">
                Close on Backdrop Click
              </mat-checkbox>
              <mat-checkbox
                [ngModel]="resizable()"
                (ngModelChange)="resizable.set($event); onConfigChange()">
                Resizable
              </mat-checkbox>
              <mat-checkbox
                [ngModel]="autoFocus()"
                (ngModelChange)="autoFocus.set($event); onConfigChange()">
                Auto Focus
              </mat-checkbox>
            </div>

            <!-- Tab Management -->
            <div class="control-group">
              <label>Tab Management</label>
              <div class="button-group">
                <button mat-raised-button (click)="addDynamicTab()" color="primary">
                  <mat-icon>add</mat-icon> Add Dynamic Tab
                </button>
                <button mat-raised-button (click)="removeDynamicTab()" [disabled]="dynamicTabs().length === 0">
                  <mat-icon>remove</mat-icon> Remove Tab
                </button>
                <button mat-raised-button (click)="toggleTabDisabled()">
                  <mat-icon>toggle_off</mat-icon> Toggle Disabled
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Event Log -->
      <mat-card class="events-card">
        <mat-card-header>
          <mat-card-title>Event Log</mat-card-title>
          <mat-card-subtitle>Real-time component events</mat-card-subtitle>
          <div class="spacer"></div>
          <button mat-icon-button (click)="clearEventLog()" [disabled]="eventLog().length === 0">
            <mat-icon>clear</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content class="event-log">
          @if (eventLog().length === 0) {
            <div class="no-events">
              No events yet. Interact with the docking panel to see events here.
            </div>
          }
          @for (event of eventLog(); track trackByEventId($index, event)) {
            <div class="event-item">
              <mat-chip [color]="getEventChipColor(event.type)">{{ event.type }}</mat-chip>
              <span class="event-time">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
              <pre class="event-data">{{ event.data | json }}</pre>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Global Docking Panel (full viewport) -->
      <div class="global-docking-wrapper">
        <app-docking-panel
          [side]="dockSide()"
          [mode]="dockMode()"
          [hasBackdrop]="hasBackdrop()"
          [closeOnBackdropClick]="closeOnBackdropClick()"
          [initialSize]="initialSize()"
          [minSize]="minSize()"
          [maxSize]="maxSize()"
          [collapsedSize]="collapsedSize()"
          [resizable]="resizable()"
          [autoFocus]="autoFocus()"
          [animationDuration]="animationDuration()"
          [tabs]="dynamicTabs()"
          (tabChange)="onTabChange($event)"
          (stateChange)="onStateChange($event)"
          (sizeChange)="onSizeChange($event)"
          (backdropClick)="onBackdropClick()">

          <!-- No main content projected; panel docks to viewport edges -->
          <!-- Projected Tab Content -->
          <ng-template dockingPanelTab="Explorer" icon="folder" id="explorer">
            <div class="tab-content">
              <h3>File Explorer</h3>
              <div class="file-tree">
                <div class="folder">
                  📁 src/
                  <div class="folder-content">
                    📁 app/
                    <div class="folder-content">
                      📁 components/
                      <div class="folder-content">
                        📄 docking-panel.component.ts<br>
                        📄 docking-panel.component.html<br>
                        📄 docking-panel.component.scss<br>
                        📄 docking-panel-demo.component.ts
                      </div>
                    </div>
                  </div>
                </div>
                <div class="folder">
                  📁 assets/
                  <div class="folder-content">
                    🖼️ logo.png<br>
                    🎨 styles.scss
                  </div>
                </div>
              </div>
              <p class="tab-note">This content is projected using ng-template with the dockingPanelTab directive.</p>
            </div>
          </ng-template>

          <ng-template dockingPanelTab="Search" icon="search" id="search">
            <div class="tab-content">
              <h3>Search & Replace</h3>
              <div class="search-interface">
                <div class="search-field">
                  <label>Search for:</label>
                  <input type="text" placeholder="Enter search term..." class="search-input">
                </div>
                <div class="search-field">
                  <label>Replace with:</label>
                  <input type="text" placeholder="Enter replacement..." class="search-input">
                </div>
                <div class="search-options">
                  <label><input type="checkbox"> Match case</label>
                  <label><input type="checkbox"> Whole word</label>
                  <label><input type="checkbox"> Use regex</label>
                </div>
                <div class="search-results">
                  <p>No search results yet.</p>
                </div>
              </div>
              <p class="tab-note">Interactive search interface with projected content.</p>
            </div>
          </ng-template>

          <ng-template dockingPanelTab="Settings" icon="settings" id="settings">
            <div class="tab-content">
              <h3>Application Settings</h3>
              <div class="settings-section">
                <h4>Appearance</h4>
                <label class="setting-item">
                  <input type="radio" name="theme" value="light" checked>
                  <span>Light Theme</span>
                </label>
                <label class="setting-item">
                  <input type="radio" name="theme" value="dark">
                  <span>Dark Theme</span>
                </label>
                <label class="setting-item">
                  <input type="radio" name="theme" value="auto">
                  <span>System Default</span>
                </label>
              </div>
              <div class="settings-section">
                <h4>Behavior</h4>
                <label class="setting-item">
                  <input type="checkbox" checked>
                  <span>Enable animations</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox">
                  <span>Auto-save changes</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox" checked>
                  <span>Show tooltips</span>
                </label>
              </div>
              <p class="tab-note">Settings interface with projected content and form controls.</p>
            </div>
          </ng-template>

        </app-docking-panel>
      </div>
    </div>
    `,
  styles: [`
    .demo-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: var(--mat-sys-on-surface);
      margin-bottom: 8px;
    }

    .controls-card {
      margin-bottom: 24px;
    }

    .controls-grid {
      display: grid;
      gap: 24px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 12px;

      label {
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }

      &.checkboxes {
        flex-direction: column;
        gap: 8px;
      }
    }

    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .events-card {
      margin-bottom: 24px;

      mat-card-header {
        display: flex;
        align-items: center;

        .spacer {
          flex: 1;
        }
      }
    }

    .event-log {
      max-height: 300px;
      overflow-y: auto;
    }

    .no-events {
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
      padding: 24px;
      font-style: italic;
    }

    .event-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);

      &:last-child {
        border-bottom: none;
      }

      .event-time {
        font-family: monospace;
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        min-width: 80px;
      }

      .event-data {
        flex: 1;
        margin: 0;
        font-size: 12px;
        background: var(--mat-sys-surface-variant);
        padding: 4px 8px;
        border-radius: 4px;
        overflow-x: auto;
      }
    }

    .global-docking-wrapper {
      position: fixed;
      inset: 0;
      z-index: 10; /* beneath backdrop/panel internal z-index */
      pointer-events: none; /* allow panel to manage interactions */
    }
    .global-docking-wrapper app-docking-panel {
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none; /* host */
    }
    .global-docking-wrapper app-docking-panel ::ng-deep .docking-panel-container,
    .global-docking-wrapper app-docking-panel ::ng-deep .docking-panel-backdrop,
    .global-docking-wrapper app-docking-panel ::ng-deep .docking-panel-main-content {
      pointer-events: auto;
    }

    .main-content {
      padding: 24px;
      height: 100%;
      overflow: auto;

      h2 {
        margin-top: 0;
        color: var(--mat-sys-on-surface);
      }

      p {
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.6;
      }
    }

    .config-display {
      padding: 16px 0;

      p {
        margin: 8px 0;
        font-family: monospace;
        font-size: 14px;
      }
    }

    .content-sections {
      margin-top: 24px;

      section {
        margin-bottom: 32px;

        h3 {
          color: var(--mat-sys-primary);
          margin-bottom: 16px;
        }

        ul {
          line-height: 1.8;
          color: var(--mat-sys-on-surface-variant);
        }
      }
    }

    .tab-content {
      padding: 24px;
      height: 100%;

      h3 {
        margin-top: 0;
        color: var(--mat-sys-on-surface);
        margin-bottom: 16px;
      }

      .tab-note {
        margin-top: 24px;
        padding: 12px;
        background: var(--mat-sys-surface-variant);
        border-radius: 8px;
        font-style: italic;
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
      }
    }

    .file-tree {
      font-family: monospace;
      line-height: 1.6;

      .folder {
        margin-bottom: 8px;
      }

      .folder-content {
        margin-left: 20px;
        padding-left: 12px;
        border-left: 1px solid var(--mat-sys-outline-variant);
      }
    }

    .search-interface {
      .search-field {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--mat-sys-outline);
          border-radius: 4px;
          background: var(--mat-sys-surface);
          color: var(--mat-sys-on-surface);

          &:focus {
            outline: 2px solid var(--mat-sys-primary);
            outline-offset: -1px;
          }
        }
      }

      .search-options {
        margin: 16px 0;

        label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          cursor: pointer;
        }
      }

      .search-results {
        margin-top: 24px;
        padding: 16px;
        background: var(--mat-sys-surface-variant);
        border-radius: 8px;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .settings-section {
      margin-bottom: 24px;

      h4 {
        color: var(--mat-sys-primary);
        margin-bottom: 12px;
      }

      .setting-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        cursor: pointer;

        input {
          margin: 0;
        }
      }
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 16px;
      }

      .controls-grid {
        grid-template-columns: 1fr;
      }

      .demo-panel-container {
        height: 400px;
      }
    }
  `]
})
export class DockingPanelDemoComponent {
  // Configuration signals
  dockSide = signal<DockingSide>('left');
  dockMode = signal<DockingMode>('push');
  hasBackdrop = signal(false);
  closeOnBackdropClick = signal(true);
  initialSize = signal(320);
  minSize = signal(200);
  maxSize = signal(600);
  collapsedSize = signal(48);
  resizable = signal(true);
  autoFocus = signal(false);
  animationDuration = signal(250);

  // Dynamic tabs
  private tabCounter = 0;
  dynamicTabs = signal<DockingPanelTab[]>([]);

  // Event logging
  private eventCounter = 0;
  eventLog = signal<Array<{id: number, type: string, timestamp: Date, data: any}>>([]);

  // Panel state tracking
  currentPanelState = signal({
    expanded: false,
    activeTabIndex: 0,
    size: 320
  });

  totalTabs = computed(() => 3 + this.dynamicTabs().length); // 3 projected + dynamic

  onConfigChange(): void {
    this.addEvent('CONFIG_CHANGE', {
      side: this.dockSide(),
      mode: this.dockMode(),
      hasBackdrop: this.hasBackdrop(),
      resizable: this.resizable(),
      size: this.initialSize(),
      animationDuration: this.animationDuration()
    });
  }

  onSizeSliderChange(event: any): void {
    this.initialSize.set(event.target.value);
    this.onConfigChange();
  }

  onAnimationSliderChange(event: any): void {
    this.animationDuration.set(event.target.value);
    this.onConfigChange();
  }

  onTabChange(event: DockingPanelTabChangeEvent): void {
    this.addEvent('TAB_CHANGE', event);
  }

  onStateChange(event: DockingPanelStateChangeEvent): void {
    this.currentPanelState.set({
      expanded: event.expanded,
      activeTabIndex: event.activeTabIndex,
      size: event.size
    });
    this.addEvent('STATE_CHANGE', event);
  }

  onSizeChange(event: DockingPanelResizeEvent): void {
    if (!event.isResizing) { // Only log final size changes
      this.addEvent('SIZE_CHANGE', event);
    }
  }

  onBackdropClick(): void {
    this.addEvent('BACKDROP_CLICK', { timestamp: new Date() });
  }

  addDynamicTab(): void {
    this.tabCounter++;
    const newTab: DockingPanelTab = {
      id: `dynamic-${this.tabCounter}`,
      label: `Dynamic ${this.tabCounter}`,
      icon: 'dynamic_form',
      disabled: false
    };
    this.dynamicTabs.update(tabs => [...tabs, newTab]);
    this.addEvent('TAB_ADDED', newTab);
  }

  removeDynamicTab(): void {
    const tabs = this.dynamicTabs();
    if (tabs.length > 0) {
      const removedTab = tabs[tabs.length - 1];
      this.dynamicTabs.update(tabs => tabs.slice(0, -1));
      this.addEvent('TAB_REMOVED', removedTab);
    }
  }

  toggleTabDisabled(): void {
    const tabs = this.dynamicTabs();
    if (tabs.length > 0) {
      const lastTab = tabs[tabs.length - 1];
      this.dynamicTabs.update(tabs =>
        tabs.map((tab, index) =>
          index === tabs.length - 1
            ? { ...tab, disabled: !tab.disabled }
            : tab
        )
      );
      this.addEvent('TAB_TOGGLED', { id: lastTab.id, disabled: !lastTab.disabled });
    }
  }

  clearEventLog(): void {
    this.eventLog.set([]);
  }

  getEventChipColor(eventType: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (eventType) {
      case 'TAB_CHANGE': return 'primary';
      case 'STATE_CHANGE': return 'accent';
      case 'SIZE_CHANGE': return 'warn';
      default: return undefined;
    }
  }

  trackByEventId(index: number, event: any): number {
    return event.id;
  }

  private addEvent(type: string, data: any): void {
    this.eventCounter++;
    const event = {
      id: this.eventCounter,
      type,
      timestamp: new Date(),
      data: this.sanitizeForLog(data)
    };
    this.eventLog.update(events => [event, ...events.slice(0, 49)]); // Keep only last 50 events
  }

  /**
   * Produces a JSON-safe shallow-ish clone of arbitrary data:
   * - Removes circular references (replaces with "[Circular]")
   * - Limits recursion depth to avoid huge payloads
   * - Compresses large arrays/objects with size summaries beyond limits
   * - Strips obviously heavy / irrelevant keys (e.g. blueprint) that create cycles
   */
  private sanitizeForLog(value: any, depth = 0, seen: WeakSet<object> = new WeakSet()): any {
    const MAX_DEPTH = 4;
    const MAX_ARRAY = 50;
    const MAX_PROPS = 50;

    if (value === null || typeof value !== 'object') {
      return value;
    }
    if (seen.has(value)) {
      return '[Circular]';
    }
    if (depth >= MAX_DEPTH) {
      if (Array.isArray(value)) return `[Array depth>${MAX_DEPTH} length=${value.length}]`;
      return `[Object depth>${MAX_DEPTH}]`;
    }
    seen.add(value);

    // Drop known heavy / cyclic keys
    if (Array.isArray(value)) {
      if (value.length > MAX_ARRAY) {
        return value.slice(0, MAX_ARRAY).map(v => this.sanitizeForLog(v, depth + 1, seen)).concat(`…(+${value.length - MAX_ARRAY} more)`);
      }
      return value.map(v => this.sanitizeForLog(v, depth + 1, seen));
    }

    const out: any = {};
    let count = 0;
    for (const [k, v] of Object.entries(value)) {
      if (k === 'blueprint') { // observed in cycle
        out[k] = '[Omitted blueprint]';
        continue;
      }
      if (count >= MAX_PROPS) {
        out['…'] = `(+${Object.keys(value).length - MAX_PROPS} more keys)`;
        break;
      }
      out[k] = this.sanitizeForLog(v, depth + 1, seen);
      count++;
    }
    return out;
  }
}
