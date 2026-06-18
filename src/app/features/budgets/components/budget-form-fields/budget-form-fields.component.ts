import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonItem, IonSelect, IonSelectOption, IonText } from '@ionic/angular/standalone';
import { Category } from '../../../../core/models/categories.model';
import { BudgetSignalForm } from '../../shared/budget-form.model';

@Component({
  selector: 'app-budget-form-fields',
  templateUrl: './budget-form-fields.component.html',
  styleUrls: ['./budget-form-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IonItem, IonInput, IonSelect, IonSelectOption, IonText],
})
export class BudgetFormFieldsComponent {
  public readonly budgetForm = input.required<BudgetSignalForm>();
  public readonly categories = input.required<Category[]>();
  public readonly showCategoryFields = input(true);
  public readonly createCategory = output<void>();
  public readonly manageCategories = output<void>();
}
