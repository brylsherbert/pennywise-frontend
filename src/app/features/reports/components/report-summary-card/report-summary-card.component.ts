import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-report-summary-card',
  templateUrl: './report-summary-card.component.html',
  styleUrls: ['./report-summary-card.component.scss'],
  imports: [CurrencyPipe, DecimalPipe, IonProgressBar],
})
export class ReportSummaryCardComponent {
  readonly totalExpense = input(0);
  readonly totalIncome = input(0);
  readonly totalAllocated = input(0);
  readonly totalUnallocated = input(0);
  readonly totalBalance = input(0);
  readonly budgetUsagePercent = input(0);
  readonly budgetUsageValue = input(0);

  protected readonly budgetUsageColor = computed(() => {
    const usagePercent = this.budgetUsagePercent();

    if (usagePercent >= 100) return 'danger';
    if (usagePercent >= 80) return 'warning';
    return 'primary';
  });
}
