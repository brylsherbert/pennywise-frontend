import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';
import { BudgetHealthReport } from '../../shared/reports.model';

@Component({
  selector: 'app-report-budget-health-card',
  templateUrl: './report-budget-health-card.component.html',
  styleUrls: ['./report-budget-health-card.component.scss'],
  imports: [CurrencyPipe, DecimalPipe, IonProgressBar],
})
export class ReportBudgetHealthCardComponent {
  readonly budgetHealth = input<BudgetHealthReport[]>([]);
}
