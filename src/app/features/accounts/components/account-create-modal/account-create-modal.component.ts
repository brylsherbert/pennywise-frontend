import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import {
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
import { closeOutline } from 'ionicons/icons';
import { CreateAccountRequest } from '../../../../core/models/accounts.model';
import { AccountsStore } from '../../../../core/services/store/accounts.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  AccountFormData,
  createAccountSignalForm,
  createDefaultAccountFormData,
} from '../../shared/account-form.model';
import { AccountFormFieldsComponent } from '../account-form-fields/account-form-fields.component';

@Component({
  selector: 'app-account-create-modal',
  templateUrl: './account-create-modal.component.html',
  styleUrls: ['./account-create-modal.component.scss'],
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
export class AccountCreateModalComponent {
  private readonly accountsStore = inject(AccountsStore);
  private readonly uiService = inject(UiService);

  public readonly isOpen = input(false);
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);

  private readonly _formModel = signal<AccountFormData>(createDefaultAccountFormData());
  private readonly _isSubmitting = signal(false);

  protected readonly formModel = this._formModel.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly accountForm = createAccountSignalForm(this._formModel);

  protected readonly isSubmitDisabled = computed(() => this.accountForm().invalid());

  constructor() {
    addIcons({ closeOutline });
  }

  protected onModalDismiss(): void {
    this.resetForm();
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const createRequest = this.toCreateRequest();

    this._isSubmitting.set(true);

    try {
      const isCreated = await this.accountsStore.createAccount(createRequest);

      if (isCreated) {
        await this.uiService.showToast('Account created successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to create account', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to create account', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected toCreateRequest(): CreateAccountRequest {
    const model = this.formModel();

    return {
      name: model.name.trim(),
      balance: String(model.balance ?? 0),
    };
  }

  private resetForm(): void {
    this._formModel.set(createDefaultAccountFormData());
    this.accountForm().reset(createDefaultAccountFormData());
    this._isSubmitting.set(false);
  }
}
