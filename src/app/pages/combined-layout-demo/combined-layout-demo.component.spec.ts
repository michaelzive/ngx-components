import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombinedLayoutDemoComponent } from './combined-layout-demo.component';
import { DockingPanelComponent } from '../../components/docking-panel/docking-panel.component';
import { SplitterComponent } from '../../components/splitter/splitter.component';

describe('CombinedLayoutDemoComponent', () => {
  let component: CombinedLayoutDemoComponent;
  let fixture: ComponentFixture<CombinedLayoutDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CombinedLayoutDemoComponent, DockingPanelComponent, SplitterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedLayoutDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});