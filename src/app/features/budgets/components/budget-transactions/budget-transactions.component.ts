import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ActionSheetController,
  IonChip,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  closeOutline,
  funnelOutline,
  swapVerticalOutline,
  walletOutline,
} from 'ionicons/icons';
import { Transaction } from '../../../../core/models/transactions.model';
import { TransactionsStore } from '../../../../core/services/store/transactions.store';
import { TransactionsItemComponent } from '../../../transactions/components/transactions-item/transactions-item.component';
import { TransactionEditModalComponent } from '../../../transactions/components/transaction-edit-modal/transaction-edit-modal.component';
import {
  buildTransactionsView,
  getTransactionFilterLabel,
  getTransactionSortLabel,
  TransactionFilterType,
  TransactionSortType,
} from '../../../transactions/shared/transactions-view.utils';

@Component({
  selector: 'app-budget-transactions',
  templateUrl: './budget-transactions.component.html',
  styleUrls: ['./budget-transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    IonSearchbar,
    IonChip,
    IonIcon,
    IonLabel,
    IonItem,
    IonItemGroup,
    TransactionsItemComponent,
    TransactionEditModalComponent,
  ],
})
export class BudgetTransactionsComponent {
  private readonly transactionsStore = inject(TransactionsStore);
  private readonly actionSheetController = inject(ActionSheetController);

  readonly budgetId = input.required<string>();

  protected readonly transactions = signal<Transaction[]>([]);
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
  protected readonly isEditModalOpen = signal(false);
  protected readonly selectedTransaction = signal<Transaction | null>(null);

  constructor() {
    addIcons({
      funnelOutline,
      swapVerticalOutline,
      closeOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      walletOutline,
    });

    effect(() => {
      const budgetId = this.budgetId();

      if (!budgetId) {
        this.transactions.set([]);
        return;
      }

      void this.loadTransactions(budgetId);
    });
  }

  async reload(): Promise<void> {
    const budgetId = this.budgetId();
    if (!budgetId) return;

    await this.loadTransactions(budgetId);
  }

  protected openEditTransactionModal(transaction: Transaction): void {
    this.selectedTransaction.set(transaction);
    this.isEditModalOpen.set(true);
  }

  protected onEditModalDismissed(): void {
    this.isEditModalOpen.set(false);
    this.selectedTransaction.set(null);
    void this.reload();
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
          handler: () => {
            this.activeFilter.set('all');
          },
        },
        {
          text: 'Expense',
          icon: 'arrow-up-circle-outline',
          handler: () => {
            this.activeFilter.set('expense');
          },
        },
        {
          text: 'Income',
          icon: 'arrow-down-circle-outline',
          handler: () => {
            this.activeFilter.set('income');
          },
        },
        {
          text: 'Fill',
          icon: 'wallet-outline',
          handler: () => {
            this.activeFilter.set('fill');
          },
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
          handler: () => {
            this.activeSort.set('date-desc');
          },
        },
        {
          text: 'Date: Oldest → Newest',
          handler: () => {
            this.activeSort.set('date-asc');
          },
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

  private async loadTransactions(budgetId: string): Promise<void> {
    const data = await this.transactionsStore.getAllTransactionsByBudgetId(budgetId);
    this.transactions.set(data ?? []);
  }
}
