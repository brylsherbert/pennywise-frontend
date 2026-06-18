import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Transaction } from '../../../../core/models/transactions.model';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { addIcons } from 'ionicons';
import {
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  cubeOutline,
  walletOutline,
} from 'ionicons/icons';

const TYPE_LABELS: Record<string, string> = {
  income: 'Income',
  expense: 'Expense',
  fill: 'Fill',
};

type SubtitlePart =
  | { kind: 'text'; value: string }
  | { kind: 'date'; value: string };

@Component({
  selector: 'app-transactions-item',
  templateUrl: './transactions-item.component.html',
  styleUrls: ['./transactions-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    IonIcon,
  ],
})
export class TransactionsItemComponent {
  private readonly budgetsStore = inject(BudgetsStore);

  constructor() {
    addIcons({
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      cubeOutline,
      walletOutline,
    });
  }

  transaction = input<Transaction | null>(null);
  selected = output<Transaction>();

  readonly type = computed(() => this.transaction()?.type);
  readonly title = computed(() => this.transaction()?.title);
  readonly transactionDate = computed(() => this.transaction()?.transaction_date);

  readonly typeLabel = computed(() => {
    const type = this.type();
    return type ? (TYPE_LABELS[type] ?? type) : '';
  });

  readonly typeIcon = computed(() => {
    switch (this.type()) {
      case 'income':
        return 'arrow-down-circle-outline';
      case 'expense':
        return 'arrow-up-circle-outline';
      case 'fill':
        return 'wallet-outline';
      default:
        return 'cube-outline';
    }
  });

  readonly amountValue = computed(() => {
    const value = Number(this.transaction()?.amount);
    return Number.isNaN(value) ? 0 : value;
  });

  readonly amountPrefix = computed(() => (this.type() === 'expense' ? '−' : '+'));

  readonly amountClass = computed(() => {
    switch (this.type()) {
      case 'income':
        return 'amount-income';
      case 'expense':
        return 'amount-expense';
      case 'fill':
        return 'amount-fill';
      default:
        return '';
    }
  });

  readonly budgetName = computed(() => {
    const budgetId = this.transaction()?.budget_id;
    if (!budgetId) return null;

    return this.budgetsStore.budgets().find(budget => budget.id === budgetId)?.name ?? null;
  });

  readonly subtitleParts = computed((): SubtitlePart[] => {
    const parts: SubtitlePart[] = [];

    const typeLabel = this.typeLabel();
    if (typeLabel) parts.push({ kind: 'text', value: typeLabel });

    const budget = this.budgetName();
    if (budget) parts.push({ kind: 'text', value: budget });

    const date = this.transactionDate();
    if (date) parts.push({ kind: 'date', value: date });

    return parts;
  });

  handleSelect(): void {
    const transaction = this.transaction();
    if (transaction) {
      this.selected.emit(transaction);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.handleSelect();
  }
}
