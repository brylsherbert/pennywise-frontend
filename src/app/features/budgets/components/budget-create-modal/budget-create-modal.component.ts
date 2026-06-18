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
import { CreateBudgetRequest } from '../../../../core/models/budgets.model';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { CategoriesStore } from '../../../../core/services/store/categories.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  BudgetFormData,
  createBudgetSignalForm,
  createDefaultBudgetFormData,
} from '../../shared/budget-form.model';
import { CategoryCreateModalComponent } from '../../../categories/components/category-create-modal/category-create-modal.component';
import { CategoriesManageModalComponent } from '../../../categories/components/categories-manage-modal/categories-manage-modal.component';
import { BudgetFormFieldsComponent } from '../budget-form-fields/budget-form-fields.component';

@Component({
  selector: 'app-budget-create-modal',
  templateUrl: './budget-create-modal.component.html',
  styleUrls: ['./budget-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BudgetFormFieldsComponent,
    CategoryCreateModalComponent,
    CategoriesManageModalComponent,
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
export class BudgetCreateModalComponent {
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly uiService = inject(UiService);

  public readonly isOpen = input(false);
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);

  protected readonly categories = this.categoriesStore.categories;

  private readonly _formModel = signal<BudgetFormData>(createDefaultBudgetFormData());
  private readonly _isSubmitting = signal(false);
  private readonly _isCategoryCreateModalOpen = signal(false);
  private readonly _isCategoriesManageModalOpen = signal(false);

  protected readonly formModel = this._formModel.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isCategoryCreateModalOpen = this._isCategoryCreateModalOpen.asReadonly();
  protected readonly isCategoriesManageModalOpen = this._isCategoriesManageModalOpen.asReadonly();
  protected readonly budgetForm = createBudgetSignalForm(this._formModel);
  protected readonly isSubmitDisabled = computed(() => this.budgetForm().invalid());

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

  protected openCategoryCreateModal(): void {
    this._isCategoryCreateModalOpen.set(true);
  }

  protected onCategoryCreateModalDismissed(): void {
    this._isCategoryCreateModalOpen.set(false);
  }

  protected onCategoryCreated(categoryId: string): void {
    if (categoryId) {
      this._formModel.update(model => ({ ...model, category_id: categoryId }));
    }
  }

  protected openCategoriesManageModal(): void {
    this._isCategoriesManageModalOpen.set(true);
  }

  protected onCategoriesManageModalDismissed(): void {
    this._isCategoriesManageModalOpen.set(false);
  }

  protected onCategoryDeleted(categoryId: string): void {
    if (this.formModel().category_id === categoryId) {
      this._formModel.update(model => ({ ...model, category_id: '' }));
    }
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const createRequest = this.toCreateRequest();

    this._isSubmitting.set(true);

    try {
      const isCreated = await this.budgetsStore.createBudget(createRequest);

      if (isCreated) {
        await this.uiService.showToast('Budget created successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to create budget', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to create budget', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected toCreateRequest(): CreateBudgetRequest {
    const model = this.formModel();

    return {
      name: model.name.trim(),
      target_amount: model.target_amount ?? 0,
      ...(model.category_id ? { category_id: model.category_id } : {}),
    };
  }

  private resetForm(): void {
    this._formModel.set(createDefaultBudgetFormData());
    this.budgetForm().reset(createDefaultBudgetFormData());
    this._isSubmitting.set(false);
  }
}
