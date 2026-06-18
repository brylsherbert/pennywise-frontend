import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonItem, IonText } from '@ionic/angular/standalone';
import {
  CATEGORY_COLOR_PRESETS,
  CategorySignalForm,
} from '../../shared/category-form.model';

@Component({
  selector: 'app-category-form-fields',
  templateUrl: './category-form-fields.component.html',
  styleUrls: ['./category-form-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IonItem, IonInput, IonText],
})
export class CategoryFormFieldsComponent {
  public readonly categoryForm = input.required<CategorySignalForm>();

  protected readonly colorPresets = CATEGORY_COLOR_PRESETS;

  protected isColorSelected(color: string): boolean {
    return this.categoryForm().color().value() === color;
  }

  protected ariaChecked(color: string): 'true' | 'false' {
    return this.isColorSelected(color) ? 'true' : 'false';
  }

  protected colorLabel(color: string): string {
    return `Select color ${color}`;
  }

  protected selectColor(color: string): void {
    this.categoryForm().color().value.set(color);
  }
}
