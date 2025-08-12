import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SplitterComponent } from './splitter.component';
import { SplitterPanelComponent } from './splitter-panel.component';

@Component({
  standalone: true,
  imports: [SplitterComponent, SplitterPanelComponent],
  template: `
    <app-splitter [layout]="layout" [panelSizes]="sizes" [minSizes]="min" [step]="step" [largeStep]="largeStep">
      <app-splitter-panel ariaLabel="Left">Left</app-splitter-panel>
      <app-splitter-panel ariaLabel="Right">Right</app-splitter-panel>
    </app-splitter>
  `,
})
class HostComponent {
  layout: 'horizontal' | 'vertical' = 'horizontal';
  sizes: [number, number] | undefined = [50, 50];
  min: [number, number] = [10, 10];
  step = 2;
  largeStep = 10;
}

function getHandle(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.debugElement.query(By.css('.splitter-handle'))!.nativeElement as HTMLElement;
}

function getPanels(fixture: ComponentFixture<any>): HTMLElement[] {
  return fixture.debugElement.queryAll(By.directive(SplitterPanelComponent)).map(d => d.nativeElement);
}

function style(el: HTMLElement, name: string): string {
  return (el.style as any)[name] ?? '';
}

describe('SplitterComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should render two panels and a handle', () => {
    const panels = getPanels(fixture);
    expect(panels.length).toBe(2);
    const handle = getHandle(fixture);
    expect(handle).toBeTruthy();
    expect(handle.getAttribute('role')).toBe('separator');
  });

  it('should apply initial sizes', () => {
    const [p0, p1] = getPanels(fixture);
    expect(style(p0, 'flexBasis')).toContain('50%');
    expect(style(p1, 'flexBasis')).toContain('50%');
  });

  it('should resize via keyboard arrows (horizontal)', () => {
    const handle = getHandle(fixture);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    const [p0, p1] = getPanels(fixture);
    expect(style(p0, 'flexBasis')).toContain('52%');
    expect(style(p1, 'flexBasis')).toContain('48%');
  });

  it('should clamp to min sizes', () => {
    const handle = getHandle(fixture);

    for (let i = 0; i < 30; i++) {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    }
    fixture.detectChanges();

    const [p0, p1] = getPanels(fixture);
    expect(style(p0, 'flexBasis')).toContain('10%');
    expect(style(p1, 'flexBasis')).toContain('90%');
  });

  it('should switch to vertical layout', () => {
    fixture.componentInstance.layout = 'vertical';
    fixture.detectChanges();

    const handle = getHandle(fixture);
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('Home/End should snap to edges', () => {
    const handle = getHandle(fixture);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();

    let [p0, p1] = getPanels(fixture);
    expect(style(p0, 'flexBasis')).toContain('10%');
    expect(style(p1, 'flexBasis')).toContain('90%');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();

    ;[p0, p1] = getPanels(fixture);
    expect(style(p0, 'flexBasis')).toContain('90%');
    expect(style(p1, 'flexBasis')).toContain('10%');
  });

  it('should set aria-controls to both panel ids', () => {
    const handle = getHandle(fixture);
    const controls = handle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const ids = controls!.trim().split(/\s+/);
    expect(ids.length).toBe(2);
    const panelEls = getPanels(fixture);
    expect(ids[0]).toBe(panelEls[0].id);
    expect(ids[1]).toBe(panelEls[1].id);
  });

  it('should update aria-valuenow and aria-valuetext on resize', () => {
    const handle = getHandle(fixture);
    const initial = Number(handle.getAttribute('aria-valuenow'));
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    const after = Number(handle.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(initial);
    const text = handle.getAttribute('aria-valuetext');
    expect(text).toContain('%');
  });
});
