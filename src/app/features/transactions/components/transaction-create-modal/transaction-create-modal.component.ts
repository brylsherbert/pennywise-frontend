import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, closeOutline } from 'ionicons/icons';
import { CreateTransactionRequest, TransactionType } from '../../../../core/models/transactions.model';
import { AccountsStore } from '../../../../core/services/store/accounts.store';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { TransactionsStore } from '../../../../core/services/store/transactions.store';
import { UiService } from '../../../../shared/services/ui.service';
import { TransactionFormFieldsComponent } from '../transaction-form-fields/transaction-form-fields.component';
import {
  createDefaultTransactionFormData,
  createTransactionSignalForm,
  isAssociationInvalid,
  isDateToday,
  showAccountFieldForType,
  showAmountFieldForType,
  showBudgetFieldForType,
  showBudgetsFieldForType,
  showTotalUnallocatedAmountFieldForType,
  TransactionFormData,
} from '../../shared/transaction-form.model';
import {
  getErrorMessage,
  refreshStoresForTransactionType,
} from '../../shared/transaction-store-refresh.utils';
import { UnallocatedBalanceHeaderComponent } from "../../../../shared/components/unallocated-balance-header/unallocated-balance-header.component";

@Component({
  selector: 'app-transaction-create-modal',
  templateUrl: './transaction-create-modal.component.html',
  styleUrls: ['./transaction-create-modal.component.scss'],
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    UnallocatedBalanceHeaderComponent
],
})
export class TransactionCreateModalComponent {
  private readonly accountsStore = inject(AccountsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly transactionStore = inject(TransactionsStore);
  private readonly uiService = inject(UiService);

  public readonly isOpen = input(false);
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);

  protected readonly accounts = this.accountsStore.accounts;
  protected readonly budgets = this.budgetsStore.budgets;

  protected readonly transactionTypes: TransactionType[] = ['expense', 'income', 'fill'];
  protected readonly transactionActionType = signal<string>('create');

  private readonly _formModel = signal<TransactionFormData>(createDefaultTransactionFormData());
  private readonly _isSubmitting = signal(false);

  protected readonly formModel = this._formModel.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();

  protected readonly transactionForm = createTransactionSignalForm(this._formModel);

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

  constructor() {
    addIcons({ closeOutline, cashOutline });
  }

  protected onModalDismiss(): void {
    this.resetForm();
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected onTypeChange(type: TransactionType): void {
    this._formModel.update(model => ({
      ...model,
      type,
      account_id: type === 'fill' ? '' : model.account_id,
      budget_id: type === 'income' ? '' : model.budget_id,
    }));
  }

  protected setToday(): void {
    const today = new Date().toISOString();
    this._formModel.update(model => ({ ...model, transaction_date: today }));
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const createRequest = this.toCreateRequest();

    this._isSubmitting.set(true);

    try {
      const isCreated = await this.transactionStore.createTransaction(createRequest);

      if (isCreated) {
        await this.uiService.showToast('Transaction created successfully', { color: 'success' });

        refreshStoresForTransactionType(createRequest.type, this.accountsStore, this.budgetsStore);
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to create transaction', { color: 'danger' });
    } catch (error: unknown) {
      await this.uiService.showToast(getErrorMessage(error, 'Failed to create transaction'), {
        color: 'danger',
      });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected toCreateRequest(): CreateTransactionRequest {
    const model = this.formModel();

    return {
      title: model.title,
      type: model.type,
      amount: model.amount ?? 0,
      budgets: model.budgets,
      transaction_date: model.transaction_date,
      ...(model.type !== 'fill' && model.account_id ? { account_id: model.account_id } : {}),
      ...(model.type !== 'income' && model.budget_id ? { budget_id: model.budget_id } : {}),
    };
  }

  private resetForm(): void {
    this._formModel.set(createDefaultTransactionFormData());
    this.transactionForm().reset(createDefaultTransactionFormData());
    this._isSubmitting.set(false);
  }
}
