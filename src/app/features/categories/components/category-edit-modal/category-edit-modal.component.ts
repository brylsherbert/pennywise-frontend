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
import { Category, UpdateCategoryRequest } from '../../../../core/models/categories.model';
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { CategoriesStore } from '../../../../core/services/store/categories.store';
import { UiService } from '../../../../shared/services/ui.service';
import {
  CategoryFormData,
  createCategorySignalForm,
  toCategoryFormData,
} from '../../shared/category-form.model';
import { CategoryFormFieldsComponent } from '../category-form-fields/category-form-fields.component';

@Component({
  selector: 'app-category-edit-modal',
  templateUrl: './category-edit-modal.component.html',
  styleUrls: ['./category-edit-modal.component.scss'],
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
export class CategoryEditModalComponent {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly uiService = inject(UiService);
  private readonly alertController = inject(AlertController);

  public readonly isOpen = input(false);
  public readonly category = input.required<Category>();
  public readonly dismissed = output<void>();
  public readonly deleted = output<string>();

  private readonly modal = viewChild(IonModal);

  private readonly _formModel = signal<CategoryFormData>({ name: '', color: '' });
  private readonly _isSubmitting = signal(false);
  private readonly _isDeleting = signal(false);

  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isDeleting = this._isDeleting.asReadonly();
  protected readonly categoryForm = createCategorySignalForm(this._formModel);

  protected readonly isSubmitDisabled = computed(() => this.categoryForm().invalid());
  protected readonly isActionDisabled = computed(
    () => this.isSubmitting() || this.isDeleting(),
  );

  constructor() {
    addIcons({ closeOutline, trashOutline });

    effect(() => {
      this._formModel.set(toCategoryFormData(this.category()));
      this.categoryForm().reset();
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

    const updateRequest = this.toUpdateRequest();

    this._isSubmitting.set(true);

    try {
      const isUpdated = await this.categoriesStore.updateCategory(this.category().id, updateRequest);

      if (isUpdated) {
        await this.categoriesStore.getAllCategories();
        await this.uiService.showToast('Category updated successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to update category', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to update category', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const category = this.category();

    const alert = await this.alertController.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.confirmDelete(category.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(id: string): Promise<void> {
    this._isDeleting.set(true);

    try {
      const isDeleted = await this.categoriesStore.deleteCategory(id);

      if (isDeleted) {
        await this.categoriesStore.getAllCategories();
        void this.budgetsStore.getAllBudgets();
        this.deleted.emit(id);
        await this.uiService.showToast('Category deleted successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to delete category', { color: 'danger' });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { error?: string } }).error?.error
          : undefined;

      await this.uiService.showToast(message ?? 'Failed to delete category', { color: 'danger' });
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toUpdateRequest(): UpdateCategoryRequest {
    const model = this._formModel();

    return {
      name: model.name.trim(),
      color: model.color,
    };
  }
}
