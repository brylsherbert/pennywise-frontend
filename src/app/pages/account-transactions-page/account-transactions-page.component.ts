import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { Navigation, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { Account } from '../../core/models/accounts.model';
import { AccountsStore } from '../../core/services/store/accounts.store';
import { AccountEditModalComponent } from '../../features/accounts/components/account-edit-modal/account-edit-modal.component';
import { AccountTransactionsComponent } from '../../features/accounts/components/account-transactions/account-transactions.component';

@Component({
  selector: 'app-account-transactions-page',
  template: `
    <ion-header mode="ios" [translucent]="false">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/accounts" text=""></ion-back-button>
        </ion-buttons>

        <ion-title>{{ account()?.name ?? 'Account' }}</ion-title>

        <ion-buttons slot="end">
          <ion-button
            [disabled]="!account()"
            (click)="openAccountEditModal()"
            aria-label="Edit account"
          >
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (accountId()) {
        <app-account-transactions #accountTransactions [accountId]="accountId()" />
      }
    </ion-content>

    @if (account(); as selectedAccount) {
      <app-account-edit-modal
        [isOpen]="isAccountEditModalOpen()"
        [account]="selectedAccount"
        (dismissed)="onAccountEditModalDismissed()"
        (deleted)="onAccountDeleted()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    AccountEditModalComponent,
    AccountTransactionsComponent,
  ],
})
export class AccountTransactionsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accountsStore = inject(AccountsStore);
  private readonly accountTransactions = viewChild<AccountTransactionsComponent>('accountTransactions');
  private readonly currentNavigation = signal<Navigation | null>(null);
  private readonly _isAccountEditModalOpen = signal(false);
  private readonly navigationAccount = computed(
    () => this.currentNavigation()?.extras?.state?.['account'] as Account | undefined,
  );

  readonly accountId = input<string>('');
  protected readonly account = computed(() => this.handleAccount());
  protected readonly isAccountEditModalOpen = this._isAccountEditModalOpen.asReadonly();

  constructor() {
    addIcons({ createOutline });
  }

  ngOnInit(): void {
    this.setCurrentNavigation();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.accountTransactions()?.reload();
    } finally {
      event.detail.complete();
    }
  }

  protected openAccountEditModal(): void {
    this._isAccountEditModalOpen.set(true);
  }

  protected onAccountEditModalDismissed(): void {
    this._isAccountEditModalOpen.set(false);
  }

  protected async onAccountDeleted(): Promise<void> {
    this._isAccountEditModalOpen.set(false);
    await this.router.navigate(['/accounts'], { replaceUrl: true });
  }

  private handleAccount(): Account | null {
    return (
      this.accountsStore.accounts().find(item => item.id === this.accountId()) ??
      this.navigationAccount() ??
      null
    );
  }

  private setCurrentNavigation(): void {
    this.currentNavigation.set(this.router.currentNavigation());
  }
}
