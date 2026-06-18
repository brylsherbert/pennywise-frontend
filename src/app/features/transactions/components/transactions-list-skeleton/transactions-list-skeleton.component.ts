import { Component } from '@angular/core';

const TRANSACTION_SKELETON_ITEMS = [1, 2, 3, 4];

@Component({
  selector: 'app-transactions-list-skeleton',
  templateUrl: './transactions-list-skeleton.component.html',
  styleUrls: ['./transactions-list-skeleton.component.scss'],
})
export class TransactionsListSkeletonComponent {
  protected readonly skeletonItems = TRANSACTION_SKELETON_ITEMS;
}
