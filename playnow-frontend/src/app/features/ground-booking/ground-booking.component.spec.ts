import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroundBookingComponent } from './ground-booking.component';

describe('GroundBookingComponent', () => {
  let component: GroundBookingComponent;
  let fixture: ComponentFixture<GroundBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroundBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroundBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
