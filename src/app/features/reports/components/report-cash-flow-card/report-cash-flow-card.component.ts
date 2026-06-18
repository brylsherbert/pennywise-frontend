import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-report-cash-flow-card',
  templateUrl: './report-cash-flow-card.component.html',
  styleUrls: ['./report-cash-flow-card.component.scss'],
  imports: [CurrencyPipe, DecimalPipe, IonProgressBar],
})
export class ReportCashFlowCardComponent {
  readonly totalIncome = input(0);
  readonly totalExpense = input(0);
  readonly netCashFlow = input(0);
  readonly hasPositiveCashFlow = input(true);
  readonly spendingToIncomePercent = input(0);
  readonly spendingToIncomeValue = input(0);

  protected readonly spendingToIncomeColor = computed(() => {
    const percent = this.spendingToIncomePercent();

    if (percent >= 100) return 'danger';
    if (percent >= 80) return 'warning';
    return 'success';
  });
}
