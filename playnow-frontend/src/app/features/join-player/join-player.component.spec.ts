import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPlayerComponent } from './join-player.component';

describe('JoinPlayerComponent', () => {
  let component: JoinPlayerComponent;
  let fixture: ComponentFixture<JoinPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JoinPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
