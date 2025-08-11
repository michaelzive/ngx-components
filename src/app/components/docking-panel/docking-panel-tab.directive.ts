import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[dockingPanelTab]',
  standalone: true
})
export class DockingPanelTabDirective {
  @Input('dockingPanelTab') label!: string;
  @Input() icon?: string;
  @Input() disabled?: boolean;
  @Input() id?: string;
  @Input() ariaLabel?: string;
  @Input() data?: any;

  constructor(public readonly template: TemplateRef<any>) {}
}