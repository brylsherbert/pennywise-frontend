import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon, IonProgressBar } from '@ionic/angular/standalone';
import { Budget } from '../../../../core/models/budgets.model';
import { addIcons } from 'ionicons';
import { walletOutline } from 'ionicons/icons';
import { buildBudgetFundingHealth } from '../../shared/budget-health.utils';
import { TransactionBudget } from '../../../../core/models/transactions.model';

@Component({
  selector: 'app-budgets-item',
  templateUrl: './budgets-item.component.html',
  styleUrls: ['./budgets-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, IonIcon, IonProgressBar],
})
export class BudgetsItemComponent {
  constructor() {
    addIcons({ walletOutline });
  }

  budget = input<Budget | null>(null);
  budgetAllocatedAmount = computed(() => Number(this.budget()?.allocated_amount))
  budgetPayloadNewAllocatedAmount = input<number | undefined>(undefined);
  categoryColor = input<string | null>(null);
  transactionActionType = input<string | null>(null);
  transactionBudget = input<TransactionBudget | undefined>();
  transactionBudgetAllocatedAmount = computed(() => Number(this.transactionBudget()?.allocated_amount));
  selected = output<Budget>();

  readonly name = computed(() => this.budget()?.name ?? '');
  readonly targetAmount = computed(() => Number(this.budget()?.target_amount ?? 0));
  readonly allocatedAmount = computed(() => {
    if (this.transactionActionType() === 'update') {
      if (this.budgetPayloadNewAllocatedAmount() !== undefined) {
        let amountWithNoAllocation = 0;
        
        if (this.transactionBudget() !== undefined) {
          amountWithNoAllocation = this.subtractAmountFromBudget(this.budgetAllocatedAmount(), this.transactionBudgetAllocatedAmount());
        }
        
        return (this.budgetPayloadNewAllocatedAmount() ?? 0) + amountWithNoAllocation;
      };
    }
    
    if (this.transactionActionType() === 'create') {
      if (this.budgetPayloadNewAllocatedAmount() !== undefined) {
        return this.budgetAllocatedAmount() + (this.budgetPayloadNewAllocatedAmount() ?? 0);
      }
    }

    return this.budgetAllocatedAmount();
  });
  readonly categoryColorRgb = computed(() => hexToRgb(this.categoryColor()));

  readonly fundingHealth = computed(() => buildBudgetFundingHealth(this.allocatedAmount(), this.targetAmount()));

  readonly progressPercent = computed(() => this.fundingHealth().percent);

  readonly progressPercentLabel = computed(() => this.fundingHealth().percentLabel);

  readonly progressValue = computed(() => this.fundingHealth().progressValue);

  readonly fundingStatus = computed(() => this.fundingHealth().status);

  readonly progressClass = computed(() => this.fundingHealth().className);

  readonly progressColor = computed(() => this.fundingHealth().color);

  readonly fundingGapDisplayAmount = computed(() => this.fundingHealth().gapAmount);

  readonly fundingGapLabel = computed(() => this.fundingHealth().gapLabel);

  readonly progressAriaLabel = computed(
    () =>
      `${this.name()}: ${this.progressPercentLabel()} funded, ${this.fundingStatus()}, ${this.fundingGapDisplayAmount()} ${this.fundingGapLabel()}`,
  );

  subtractAmountFromBudget(totalAllocatedAmount: number, existingTransactionBudgetAmount: number) {
    const result = totalAllocatedAmount - existingTransactionBudgetAmount;
    return Number(result);
  }

  handleSelect(): void {
    const budget = this.budget();

    if (budget) {
      this.selected.emit(budget);
    }
  }
}

function hexToRgb(color: string | null): string | null {
  if (!color?.startsWith('#')) {
    return null;
  }

  const value = color.slice(1);
  const normalized = value.length === 3
    ? value.split('').map((character) => character + character).join('')
    : value;

  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return null;
  }

  return [
    normalized.slice(0, 2),
    normalized.slice(2, 4),
    normalized.slice(4, 6),
  ]
    .map((channel) => parseInt(channel, 16))
    .join(', ');
}
