import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BudgetsPageComponent } from './budgets-page.component';

describe('BudgetsPageComponent', () => {
  let component: BudgetsPageComponent;
  let fixture: ComponentFixture<BudgetsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BudgetsPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
