import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonItem, IonText } from '@ionic/angular/standalone';
import { AccountSignalForm } from '../../shared/account-form.model';

@Component({
  selector: 'app-account-form-fields',
  templateUrl: './account-form-fields.component.html',
  styleUrls: ['./account-form-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IonItem, IonInput, IonText],
})
export class AccountFormFieldsComponent {
  public readonly accountForm = input.required<AccountSignalForm>();
}
