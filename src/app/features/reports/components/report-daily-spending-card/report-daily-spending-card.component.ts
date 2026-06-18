import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { IonPopover } from '@ionic/angular/standalone';
import { SpendingDayReport } from '../../shared/reports.model';

@Component({
  selector: 'app-report-daily-spending-card',
  templateUrl: './report-daily-spending-card.component.html',
  styleUrls: ['./report-daily-spending-card.component.scss'],
  imports: [CurrencyPipe, DatePipe, IonPopover],
})
export class ReportDailySpendingCardComponent {
  readonly recentSpending = input<SpendingDayReport[]>([]);
  readonly currentDate = input.required<Date>();

  protected readonly selectedSpendingDay = signal<SpendingDayReport | null>(null);
  protected readonly spendingPopoverEvent = signal<Event | null>(null);

  protected openSpendingPopover(day: SpendingDayReport, event: Event): void {
    this.selectedSpendingDay.set(day);
    this.spendingPopoverEvent.set(event);
  }

  protected closeSpendingPopover(): void {
    this.selectedSpendingDay.set(null);
    this.spendingPopoverEvent.set(null);
  }
}
