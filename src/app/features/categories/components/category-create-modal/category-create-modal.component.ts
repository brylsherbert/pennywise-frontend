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
import { CreateCategoryRequest } from '../../../../core/models/categories.model';
import { CategoriesStore } from '../../../../core/services/store/categories.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  CategoryFormData,
  createCategorySignalForm,
  createDefaultCategoryFormData,
} from '../../shared/category-form.model';
import { CategoryFormFieldsComponent } from '../category-form-fields/category-form-fields.component';

@Component({
  selector: 'app-category-create-modal',
  templateUrl: './category-create-modal.component.html',
  styleUrls: ['./category-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryFormFieldsComponent,
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
export class CategoryCreateModalComponent {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly uiService = inject(UiService);

  public readonly isOpen = input(false);
  public readonly created = output<string>();
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);

  private readonly _formModel = signal<CategoryFormData>(createDefaultCategoryFormData());
  private readonly _isSubmitting = signal(false);

  protected readonly formModel = this._formModel.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly categoryForm = createCategorySignalForm(this._formModel);
  protected readonly isSubmitDisabled = computed(() => this.categoryForm().invalid());

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
      const createdCategory = await this.categoriesStore.createCategory(createRequest);

      if (createdCategory) {
        await this.categoriesStore.getAllCategories();
        await this.uiService.showToast('Category created successfully', { color: 'success' });
        this.created.emit(createdCategory.id);
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to create category', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to create category', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected toCreateRequest(): CreateCategoryRequest {
    const model = this.formModel();

    return {
      name: model.name.trim(),
      color: model.color,
    };
  }

  private resetForm(): void {
    this._formModel.set(createDefaultCategoryFormData());
    this.categoryForm().reset(createDefaultCategoryFormData());
    this._isSubmitting.set(false);
  }
}
