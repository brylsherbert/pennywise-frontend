import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Budget } from '../../../../core/models/budgets.model';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton} from '@ionic/angular/standalone';
import { TransactionBudgetPayload } from '../../shared/transaction-form.model';
import { TransactionBudget } from '../../../../core/models/transactions.model';

@Component({
  selector: 'app-transaction-budget-allocation-modal',
  templateUrl: './transaction-budget-allocation-modal.component.html',
  styleUrls: ['./transaction-budget-allocation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonInput, IonItem, IonContent, IonTitle, IonToolbar, IonHeader]
})
export class TransactionBudgetAllocationModalComponent implements AfterViewInit {
  private readonly modalController = inject(ModalController);
  
  readonly budget = input.required<Budget>();
  readonly budgetPayload = input.required<TransactionBudgetPayload>();
  readonly transactionBudget = input<TransactionBudget>();
  readonly budgetPayloadNewAllocatedAmount = computed(() => this.budgetPayload()?.new_allocated_amount);
  readonly transactionBudgetAllocatedAmount = computed(() => Number(this.transactionBudget()?.allocated_amount) ?? 0);
  readonly transactionActionType = input.required();
  readonly budgetId = computed(() => this.budget().id);
  readonly budgetName = computed(() => this.budget().name);
  readonly budgetAllocatedAmount = computed(() => {
    if (this.transactionActionType() === 'update') {
      if (this.budgetPayloadNewAllocatedAmount()) return this.budgetPayloadNewAllocatedAmount();

      return this.transactionBudgetAllocatedAmount();
    }

    if (this.transactionActionType() === 'create') { 
      if (this.budgetPayloadNewAllocatedAmount()) return this.budgetPayloadNewAllocatedAmount();
    }

    return 0;
  });

  protected readonly amountInput = viewChild.required(IonInput);

  async ngAfterViewInit(): Promise<void> {
    setTimeout(async () => {
      await this.amountInput().setFocus();
    }, 200);
  }

  protected amount = signal<number | undefined>(undefined);

  protected cancel(): void {
    void this.modalController.dismiss(null, 'cancel');
  }

  protected setAmount(event: Event): void {
    const input = event.target as HTMLIonInputElement;
    
    const value = Number(input.value);
  
    this.amount.set(value);
  }

  protected save(): void {
    const newAllocatedAmount = this.amount() === undefined ? this.budgetAllocatedAmount() : this.amount();

    void this.modalController.dismiss(
      {
        budget_id: this.budgetId(),
        new_allocated_amount: newAllocatedAmount,
      },
      'save'
    );
  }
}
