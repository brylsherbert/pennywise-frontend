import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonRefresher, IonRefresherContent, IonSearchbar, IonChip, IonIcon, IonLabel, IonItem, RefresherCustomEvent, ActionSheetController, IonItemGroup, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { TransactionsStore } from '../../core/services/store/transactions.store';
import { addIcons } from 'ionicons';
import { arrowDownCircleOutline, arrowUpCircleOutline, closeOutline, funnelOutline, swapVerticalOutline, walletOutline } from 'ionicons/icons';
import { TransactionsListSkeletonComponent } from '../../features/transactions/components/transactions-list-skeleton/transactions-list-skeleton.component';
import { TransactionsItemComponent } from '../../features/transactions/components/transactions-item/transactions-item.component';
import { Transaction } from '../../core/models/transactions.model';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { TransactionEditModalComponent } from '../../features/transactions/components/transaction-edit-modal/transaction-edit-modal.component';
import { formatCompactCurrency, toAmount } from '../../shared/utils/amount-format.utils';
import {
  buildTransactionsView,
  getTransactionFilterLabel,
  getTransactionSortLabel,
  TransactionFilterType,
  TransactionSortType,
} from '../../features/transactions/shared/transactions-view.utils';

@Component({
  selector: 'app-transactions-page',
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonItemGroup,
    IonItem,
    IonLabel,
    IonIcon,
    IonChip,
    IonSearchbar,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    TransactionsListSkeletonComponent,
    TransactionsItemComponent,
    DatePipe,
    HeaderComponent,
    TransactionEditModalComponent,
  ],
})
export class TransactionsPageComponent {
  private readonly transactionStore = inject(TransactionsStore);
  private readonly actionSheetController = inject(ActionSheetController);

  protected readonly transactions = this.transactionStore.transactions;
  protected readonly isLoadingTransactions = this.transactionStore.loading;
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<TransactionFilterType>('all');
  protected readonly activeSort = signal<TransactionSortType>('default');
  protected readonly isFilterActive = computed(() => this.activeFilter() !== 'all');
  protected readonly isSortActive = computed(() => this.activeSort() !== 'default');
  protected readonly filterLabel = computed(() => getTransactionFilterLabel(this.activeFilter()));
  protected readonly sortLabel = computed(() => getTransactionSortLabel(this.activeSort()));
  protected readonly transactionsView = computed(() =>
    buildTransactionsView(
      this.transactions(),
      this.searchQuery(),
      this.activeFilter(),
      this.activeSort(),
    ),
  );
  protected readonly groupedTransactions = computed(() => this.transactionsView().groups);
  protected readonly filteredCount = computed(() => this.transactionsView().filteredCount);
  protected readonly hasMoreTransactions = this.transactionStore.hasMore;
  protected readonly nextTranscationCursor = this.transactionStore.nextCursor;
  protected readonly isEditModalOpen = signal(false);
  protected readonly selectedTransaction = signal<Transaction | null>(null);
  protected readonly headerSummary = computed(() => {
    const spent = this.transactions().reduce(
      (total, transaction) => transaction.type === 'expense' ? total + toAmount(transaction.amount) : total,
      0,
    );

    return `${formatCompactCurrency(spent)} spent`;
  });

  constructor() {
    addIcons({
      funnelOutline,
      swapVerticalOutline,
      closeOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      walletOutline,
    });
  }

  protected openEditTransactionModal(transaction: Transaction): void {
    this.selectedTransaction.set(transaction);
    this.isEditModalOpen.set(true);
  }

  protected onEditModalDismissed(): void {
    this.isEditModalOpen.set(false);
    this.selectedTransaction.set(null);
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      this.transactionStore.clearTransactions();
      await this.transactionStore.getAllTransactions();
    } finally {
      event.detail.complete();
    }
  }

  protected onSearch(event: Event): void {
    const value = (event as CustomEvent<{ value?: string }>).detail.value;
    this.searchQuery.set(value?.toLowerCase() ?? '');
  }

  protected async openFilter(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filter Transactions',
      buttons: [
        {
          text: 'All Transactions',
          icon: 'cube-outline',
          handler: () => { this.activeFilter.set('all'); },
        },
        {
          text: 'Expense',
          icon: 'arrow-up-circle-outline',
          handler: () => { this.activeFilter.set('expense'); },
        },
        {
          text: 'Income',
          icon: 'arrow-down-circle-outline',
          handler: () => { this.activeFilter.set('income'); },
        },
        {
          text: 'Fill',
          icon: 'wallet-outline',
          handler: () => { this.activeFilter.set('fill'); },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  protected async openSort(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sort Transactions',
      buttons: [
        {
          text: 'Date: Newest → Oldest',
          handler: () => { this.activeSort.set('date-desc'); },
        },
        {
          text: 'Date: Oldest → Newest',
          handler: () => { this.activeSort.set('date-asc'); },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  protected clearFilters(): void {
    this.activeFilter.set('all');
    this.activeSort.set('default');
  }

  protected async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    try {
      if (this.hasMoreTransactions() && this.nextTranscationCursor()) {
        await this.transactionStore.getAllTransactions({
          cursor: this.nextTranscationCursor()!,
          limit: this.transactionStore.defaultTransactionsLimit,
        });
      }
    } catch (error) {
      console.error('[TransactionPage] Error loading more transactions:', error);
    } finally {
      event.target.complete();
    }
  }
}

