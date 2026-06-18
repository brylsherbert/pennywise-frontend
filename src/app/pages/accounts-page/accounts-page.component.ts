import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { Account } from '../../core/models/accounts.model';
import { AccountsStore } from '../../core/services/store/accounts.store';
import { AccountCardComponent } from '../../features/accounts/components/account-card/account-card.component';
import { AccountsListSkeletonComponent } from '../../features/accounts/components/accounts-list-skeleton/accounts-list-skeleton.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { formatCompactCurrency, toAmount } from '../../shared/utils/amount-format.utils';

@Component({
  selector: 'app-accounts-page',
  templateUrl: './accounts-page.component.html',
  styleUrls: ['./accounts-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonItem,
    IonLabel,
    HeaderComponent,
    AccountCardComponent,
    AccountsListSkeletonComponent,
  ],
})
export class AccountsPageComponent {
  private readonly accountsStore = inject(AccountsStore);
  private readonly router = inject(Router);

  protected readonly accounts = this.accountsStore.accounts;
  protected readonly isLoadingAccounts = this.accountsStore.loading;
  protected readonly headerSummary = computed(() => {
    const balance = this.accounts().reduce(
      (total, account) => total + toAmount(account.balance),
      0,
    );

    return `${formatCompactCurrency(balance)} balance`;
  });

  protected openAccount(account: Account): void {
    void this.router.navigate(['/accounts', account.id], { state: { account } });
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      this.accountsStore.clearAccounts();
      await this.accountsStore.getAllAccounts();
    } finally {
      event.detail.complete();
    }
  }
}

