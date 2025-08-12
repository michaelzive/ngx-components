import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, input } from '@angular/core';

let nextPanelId = 0;

@Component({
  selector: 'app-splitter-panel',
  standalone: true,
  template: `
    <div class="panel-content" [attr.aria-label]="ariaLabel() || null" role="region">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `:host{display:block;min-width:0;min-height:0;}
     .panel-content{height:100%;width:100%;}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterPanelComponent {
  // Optional label to help name the region contained in this panel
  ariaLabel = input<string | undefined>(undefined);

  // Expose a stable ID so the splitter can reference panels via aria-controls
  private readonly _id = `app-splitter-panel-${++nextPanelId}`;

  @HostBinding('attr.id') get hostId(): string { return this._id; }
  @HostBinding('class.splitter-panel') hostClass = true;

  constructor(public readonly elementRef: ElementRef<HTMLElement>) {}

  // For parent consumption
  id(): string { return this._id; }
}

export type SplitterPanelInstance = SplitterPanelComponent;
