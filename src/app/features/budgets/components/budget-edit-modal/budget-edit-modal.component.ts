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
import { Budget, UpdateBudgetRequest } from '../../../../core/models/budgets.model';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  BudgetFormData,
  createBudgetSignalForm,
  toBudgetFormData,
} from '../../shared/budget-form.model';
import { BudgetFormFieldsComponent } from '../budget-form-fields/budget-form-fields.component';

@Component({
  selector: 'app-budget-edit-modal',
  templateUrl: './budget-edit-modal.component.html',
  styleUrls: ['./budget-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BudgetFormFieldsComponent,
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
export class BudgetEditModalComponent {
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly uiService = inject(UiService);
  private readonly alertController = inject(AlertController);

  public readonly isOpen = input(false);
  public readonly budget = input<Budget | null>(null);
  public readonly dismissed = output<void>();
  public readonly deleted = output<void>();

  private readonly modal = viewChild(IonModal);

  private readonly _formModel = signal<BudgetFormData>({
    name: '',
    target_amount: null,
    category_id: '',
  });
  private readonly _isSubmitting = signal(false);
  private readonly _isDeleting = signal(false);

  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isDeleting = this._isDeleting.asReadonly();
  protected readonly budgetForm = createBudgetSignalForm(this._formModel);
  protected readonly isSubmitDisabled = computed(() => this.budgetForm().invalid());
  protected readonly isActionDisabled = computed(
    () => this.isSubmitting() || this.isDeleting(),
  );

  constructor() {
    addIcons({ closeOutline, trashOutline });

    effect(() => {
      const budget = this.budget();
      if (!budget) return;

      this._formModel.set(toBudgetFormData(budget));
      this.budgetForm().reset();
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

    const budget = this.budget();
    if (!budget) return;

    const updateRequest = this.toUpdateRequest();

    this._isSubmitting.set(true);

    try {
      const isUpdated = await this.budgetsStore.updateBudget(budget.id, updateRequest);

      if (isUpdated) {
        await this.uiService.showToast('Budget updated successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to update budget', { color: 'danger' });
    } catch (error: unknown) {
      await this.uiService.showToast(getErrorMessage(error, 'Failed to update budget'), {
        color: 'danger',
      });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const budget = this.budget();
    if (!budget) return;

    const alert = await this.alertController.create({
      header: 'Delete Budget',
      message: `Are you sure you want to delete "${budget.name}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.confirmDelete(budget.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(id: string): Promise<void> {
    this._isDeleting.set(true);

    try {
      const isDeleted = await this.budgetsStore.deleteBudget(id);

      if (isDeleted) {
        void this.budgetsStore.getBudgetSummary();
        await this.uiService.showToast('Budget deleted successfully', { color: 'success' });
        await this.closeModal();
        this.deleted.emit();
        return;
      }

      await this.uiService.showToast('Failed to delete budget', { color: 'danger' });
    } catch (error: unknown) {
      await this.uiService.showToast(getErrorMessage(error, 'Failed to delete budget'), {
        color: 'danger',
      });
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toUpdateRequest(): UpdateBudgetRequest {
    const model = this._formModel();

    return {
      name: model.name.trim(),
      target_amount: model.target_amount ?? 0,
    };
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('error' in error)) return fallback;

  return (error as { error?: { error?: string } }).error?.error ?? fallback;
}
