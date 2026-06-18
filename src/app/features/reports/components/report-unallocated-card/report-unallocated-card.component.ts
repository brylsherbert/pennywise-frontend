import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-report-unallocated-card',
  templateUrl: './report-unallocated-card.component.html',
  styleUrls: ['./report-unallocated-card.component.scss'],
  imports: [CurrencyPipe, DecimalPipe, IonProgressBar],
})
export class ReportUnallocatedCardComponent {
  readonly totalUnallocated = input(0);
  readonly totalBalance = input(0);
  readonly unallocatedSharePercent = input(0);
  readonly unallocatedShareValue = input(0);
}
