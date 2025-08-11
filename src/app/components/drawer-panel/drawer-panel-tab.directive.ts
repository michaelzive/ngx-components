import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[drawerPanelTab]',
  standalone: true
})
export class DrawerPanelTabDirective {
  @Input('drawerPanelTab') label!: string; // required label
  @Input() icon?: string;
  @Input() disabled?: boolean;
  @Input() id?: string;
  @Input() ariaLabel?: string;
  @Input() data?: any;

  constructor(public readonly template: TemplateRef<any>) {}
}
