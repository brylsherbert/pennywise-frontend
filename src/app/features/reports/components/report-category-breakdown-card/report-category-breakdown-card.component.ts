import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { CategoryBreakdownReport } from '../../shared/reports.model';

@Component({
  selector: 'app-report-category-breakdown-card',
  templateUrl: './report-category-breakdown-card.component.html',
  styleUrls: ['./report-category-breakdown-card.component.scss'],
  imports: [CurrencyPipe, DecimalPipe],
})
export class ReportCategoryBreakdownCardComponent {
  readonly categoryBreakdown = input<CategoryBreakdownReport[]>([]);
}
