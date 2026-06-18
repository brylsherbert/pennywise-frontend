import { Component } from '@angular/core';

const ACCOUNT_SKELETON_ITEMS = [1, 2, 3];

@Component({
  selector: 'app-accounts-list-skeleton',
  templateUrl: './accounts-list-skeleton.component.html',
  styleUrls: ['./accounts-list-skeleton.component.scss'],
})
export class AccountsListSkeletonComponent {
  protected readonly skeletonItems = ACCOUNT_SKELETON_ITEMS;
}
