import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, closeOutline } from 'ionicons/icons';
import { Category } from '../../../../core/models/categories.model';
import { CategoriesStore } from '../../../../core/services/store/categories.store';
import { CategoryEditModalComponent } from '../category-edit-modal/category-edit-modal.component';

@Component({
  selector: 'app-categories-manage-modal',
  templateUrl: './categories-manage-modal.component.html',
  styleUrls: ['./categories-manage-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryEditModalComponent,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class CategoriesManageModalComponent {
  private readonly categoriesStore = inject(CategoriesStore);

  public readonly isOpen = input(false);
  public readonly dismissed = output<void>();
  public readonly categoryDeleted = output<string>();

  private readonly modal = viewChild(IonModal);

  protected readonly categories = this.categoriesStore.categories;
  protected readonly loading = this.categoriesStore.loading;

  private readonly _selectedCategory = signal<Category | null>(null);
  private readonly _isEditModalOpen = signal(false);

  protected readonly selectedCategory = this._selectedCategory.asReadonly();
  protected readonly isEditModalOpen = this._isEditModalOpen.asReadonly();

  constructor() {
    addIcons({ closeOutline, chevronForwardOutline });

    effect(() => {
      if (this.isOpen()) {
        void this.categoriesStore.getAllCategories();
      }
    });
  }

  protected onModalDismiss(): void {
    this._selectedCategory.set(null);
    this._isEditModalOpen.set(false);
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected openEditCategory(category: Category): void {
    this._selectedCategory.set(category);
    this._isEditModalOpen.set(true);
  }

  protected onEditModalDismissed(): void {
    this._isEditModalOpen.set(false);
    this._selectedCategory.set(null);
  }

  protected onCategoryDeleted(categoryId: string): void {
    this.categoryDeleted.emit(categoryId);
  }
}
