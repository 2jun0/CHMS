import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintMileageListComponent } from './print-mileage-list.component';

describe('PrintMileageListComponent', () => {
  let component: PrintMileageListComponent;
  let fixture: ComponentFixture<PrintMileageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintMileageListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintMileageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
