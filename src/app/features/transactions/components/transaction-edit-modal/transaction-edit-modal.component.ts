import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';
import {
  Transaction,
  TransactionBudget,
  UpdateTransactionRequest,
} from '../../../../core/models/transactions.model';
import { AccountsStore } from '../../../../core/services/store/accounts.store';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { TransactionsStore } from '../../../../core/services/store/transactions.store';
import { UiService } from '../../../../shared/services/ui.service';
import { TransactionFormFieldsComponent } from '../transaction-form-fields/transaction-form-fields.component';
import {
  createTransactionSignalForm,
  isAssociationInvalid,
  isDateToday,
  showAccountFieldForType,
  showAmountFieldForType,
  showBudgetFieldForType,
  showBudgetsFieldForType,
  showTotalUnallocatedAmountFieldForType,
  TransactionBudgetPayload,
  TransactionFormData,
} from '../../shared/transaction-form.model';
import {
  getErrorMessage,
  refreshStoresForTransactionType,
} from '../../shared/transaction-store-refresh.utils';
import { UnallocatedBalanceHeaderComponent } from "../../../../shared/components/unallocated-balance-header/unallocated-balance-header.component";

function toFormData(transaction: Transaction): TransactionFormData {
  return {
    account_id: transaction.account_id ?? '',
    budget_id: transaction.budget_id ?? '',
    budgets: [],
    title: transaction.title,
    type: transaction.type as TransactionFormData['type'],
    amount: Number(transaction.amount),
    transaction_date: transaction.transaction_date,
  };
}

@Component({
  selector: 'app-transaction-edit-modal',
  templateUrl: './transaction-edit-modal.component.html',
  styleUrls: ['./transaction-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TitleCasePipe,
    TransactionFormFieldsComponent,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonChip,
    IonLabel,
    IonSpinner,
    UnallocatedBalanceHeaderComponent
],
})
export class TransactionEditModalComponent {
  private readonly accountsStore = inject(AccountsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly transactionStore = inject(TransactionsStore);
  private readonly uiService = inject(UiService);
  private readonly alertController = inject(AlertController);

  public readonly isOpen = input(false);
  public readonly transaction = input.required<Transaction>();
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);

  protected readonly accounts = this.accountsStore.accounts;
  protected readonly budgets = this.budgetsStore.budgets;

  private readonly _formModel = signal<TransactionFormData>({
    account_id: '',
    budget_id: '',
    title: '',
    budgets: [],
    type: 'expense',
    amount: 0,
    transaction_date: '',
  });
  private readonly _isSubmitting = signal(false);
  private readonly _isDeleting = signal(false);

  protected readonly formModel = this._formModel.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isDeleting = this._isDeleting.asReadonly();

  protected readonly transactionForm = createTransactionSignalForm(this._formModel);
  protected readonly transactionActionType = signal<string>('update');
  protected readonly transactionBudgets = signal<TransactionBudget[] | undefined>(undefined);

  protected readonly selectedDate = computed(() => this.formModel().transaction_date);
  protected readonly selectedType = computed(() => this.formModel().type);
  protected readonly showAccountField = computed(() => showAccountFieldForType(this.selectedType()));
  protected readonly showBudgetField = computed(() => showBudgetFieldForType(this.selectedType()));
  protected readonly showAmountField = computed(() => showAmountFieldForType(this.selectedType()));
  protected readonly showBudgetsField = computed(() => showBudgetsFieldForType(this.selectedType()));
  protected readonly showTotalUnallocatedAmountField = computed(() => showTotalUnallocatedAmountFieldForType(this.selectedType()));

  protected readonly totalUnallocated = computed(() => Number(this.budgetsStore.budgetSummary()?.total_unallocated));

  protected readonly isSubmitDisabled = computed(
    () => this.transactionForm().invalid() || isAssociationInvalid(this.formModel()),
  );

  protected readonly isSelectedToday = computed(() => isDateToday(this.selectedDate()));

  protected readonly isActionDisabled = computed(
    () => this.isSubmitting() || this.isDeleting(),
  );

  constructor() {
    addIcons({ closeOutline, trashOutline });

    effect(() => {
      this._formModel.set(toFormData(this.transaction()));
      this.transactionForm().reset();
      this._isSubmitting.set(false);
      this._isDeleting.set(false);
    });

    effect(async () => {
      const transaction = this.transaction();

      if (this.selectedType() === 'fill') {
        await this.updateFormModelTransactionBudgets(transaction);
      }
    })
  }

  private async updateFormModelTransactionBudgets(transaction: Transaction) {
    if (!transaction) return;

    const transactionBudgets = await this.transactionStore.getAllTransactionBudgetByTransactionId(transaction?.id);

    if (transactionBudgets && transactionBudgets?.length > 0) {
      this.transactionBudgets.set(transactionBudgets);

      const mappedTransactionBudgets = (transactionBudgets)?.map((budget: TransactionBudget) => ({
        budget_id: budget.budget_id,
        new_allocated_amount: Number(budget.allocated_amount)
      }));
  
      this._formModel.update(model => ({
        ...model,
        budgets: mappedTransactionBudgets ?? []
      }));
    }
  }

  protected onModalDismiss(): void {
    this._isSubmitting.set(false);
    this._isDeleting.set(false);
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected setToday(): void {
    const today = new Date().toISOString();
    this._formModel.update(model => ({ ...model, transaction_date: today }));
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const updateRequest = this.toUpdateRequest();

    this._isSubmitting.set(true);

    try {
      const isUpdated = await this.transactionStore.updateTransaction(this.transaction().id, updateRequest);

      if (isUpdated) {
        refreshStoresForTransactionType(this.selectedType(), this.accountsStore, this.budgetsStore);
        await this.uiService.showToast('Transaction updated successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to update transaction', { color: 'danger' });
    } catch (error: unknown) {
      await this.uiService.showToast(getErrorMessage(error, 'Failed to update transaction'), {
        color: 'danger',
      });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const transaction = this.transaction();

    const alert = await this.alertController.create({
      header: 'Delete Transaction',
      message: `Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.confirmDelete(transaction.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(id: string): Promise<void> {
    this._isDeleting.set(true);

    try {
      const isDeleted = await this.transactionStore.deleteTransaction(id);

      if (isDeleted) {
        refreshStoresForTransactionType(this.selectedType(), this.accountsStore, this.budgetsStore);
        await this.uiService.showToast('Transaction deleted successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to delete transaction', { color: 'danger' });
    } catch (error: unknown) {
      await this.uiService.showToast(getErrorMessage(error, 'Failed to delete transaction'), {
        color: 'danger',
      });
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toUpdateRequest(): UpdateTransactionRequest {
    const model = this.formModel();

    return {
      title: model.title,
      amount: model.amount ?? 0,
      budgets: model.budgets,
      transaction_date: model.transaction_date,
      ...(model.type !== 'fill' && model.account_id ? { account_id: model.account_id } : {}),
      ...(model.type !== 'income' && model.budget_id ? { budget_id: model.budget_id } : {}),
    };
  }
}
