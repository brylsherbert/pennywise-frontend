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
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';
import { Account, UpdateAccountRequest } from '../../../../core/models/accounts.model';
import { AccountsStore } from '../../../../core/services/store/accounts.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  AccountFormData,
  createAccountSignalForm,
  toAccountFormData,
} from '../../shared/account-form.model';
import { AccountFormFieldsComponent } from '../account-form-fields/account-form-fields.component';
import { TransactionsStore } from '../../../../core/services/store/transactions.store';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';

@Component({
  selector: 'app-account-edit-modal',
  templateUrl: './account-edit-modal.component.html',
  styleUrls: ['./account-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccountFormFieldsComponent,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
  ],
})
export class AccountEditModalComponent {
  private readonly accountsStore = inject(AccountsStore);
  private readonly transactionStore = inject(TransactionsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly uiService = inject(UiService);
  private readonly alertController = inject(AlertController);

  public readonly isOpen = input(false);
  public readonly account = input<Account | null>(null);
  public readonly dismissed = output<void>();
  public readonly deleted = output<void>();

  private readonly modal = viewChild(IonModal);

  private readonly _formModel = signal<AccountFormData>({ name: '', balance: null });
  private readonly _isSubmitting = signal(false);
  private readonly _isDeleting = signal(false);

  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isDeleting = this._isDeleting.asReadonly();
  protected readonly accountForm = createAccountSignalForm(this._formModel);

  protected readonly isSubmitDisabled = computed(() => this.accountForm().invalid());
  protected readonly isActionDisabled = computed(
    () => this.isSubmitting() || this.isDeleting(),
  );

  constructor() {
    addIcons({ closeOutline, trashOutline });

    effect(() => {
      const account = this.account();
      if (!account) return;

      this._formModel.set(toAccountFormData(account));
      this.accountForm().reset();
      this._isSubmitting.set(false);
      this._isDeleting.set(false);
    });
  }

  protected onModalDismiss(): void {
    this._isSubmitting.set(false);
    this._isDeleting.set(false);
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const account = this.account();
    if (!account) return;

    const updateRequest = this.toUpdateRequest();

    this._isSubmitting.set(true);

    try {
      const isUpdated = await this.accountsStore.updateAccount(account.id, updateRequest);

      if (isUpdated) {
        await this.uiService.showToast('Account updated successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to update account', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to update account', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const account = this.account();
    if (!account) return;

    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.confirmDelete(account.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(id: string): Promise<void> {
    this._isDeleting.set(true);

    try {
      const isDeleted = await this.accountsStore.deleteAccount(id);

      if (isDeleted) {
        void this.handleRefreshStore();
        await this.uiService.showToast('Account deleted successfully', { color: 'success' });
        await this.closeModal();
        this.deleted.emit();
        return;
      }

      await this.uiService.showToast('Failed to delete account', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to delete account', { color: 'danger' });
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toUpdateRequest(): UpdateAccountRequest {
    const model = this._formModel();

    return {
      name: model.name.trim(),
      balance: String(model.balance ?? 0),
    };
  }

  handleRefreshStore() {
    void this.budgetsStore.getAllBudgets();
    void this.transactionStore.getAllTransactions();
  }
}
