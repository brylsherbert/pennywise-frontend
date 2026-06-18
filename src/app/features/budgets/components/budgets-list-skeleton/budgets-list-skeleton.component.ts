import { Component } from '@angular/core';

const BUDGET_SKELETON_ITEMS = [1, 2, 3];

@Component({
  selector: 'app-budgets-list-skeleton',
  templateUrl: './budgets-list-skeleton.component.html',
  styleUrls: ['./budgets-list-skeleton.component.scss'],
})
export class BudgetsListSkeletonComponent {
  protected readonly skeletonItems = BUDGET_SKELETON_ITEMS;
}
