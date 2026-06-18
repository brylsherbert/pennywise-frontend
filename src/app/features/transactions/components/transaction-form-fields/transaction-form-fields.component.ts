import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonButton,
  IonDatetime,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { FormField } from '@angular/forms/signals';
import { addIcons } from 'ionicons';
import { calendarClearOutline, todayOutline } from 'ionicons/icons';
import { Account } from '../../../../core/models/accounts.model';
import { Budget } from '../../../../core/models/budgets.model';
import { TransactionSignalForm } from '../../shared/transaction-form.model';

@Component({
  selector: 'app-transaction-form-fields',
  templateUrl: './transaction-form-fields.component.html',
  styleUrls: ['./transaction-form-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormField,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonButton,
    IonIcon,
    IonDatetime,
  ],
})
export class TransactionFormFieldsComponent {
  public readonly transactionForm = input.required<TransactionSignalForm>();
  public readonly accounts = input.required<Account[]>();
  public readonly budgets = input.required<Budget[]>();
  public readonly showAccountField = input.required<boolean>();
  public readonly showBudgetField = input.required<boolean>();
  public readonly selectedDate = input.required<string>();
  public readonly isSelectedToday = input.required<boolean>();

  public readonly setTodayClick = output<void>();

  constructor() {
    addIcons({ calendarClearOutline, todayOutline });
  }

  protected onSetToday(): void {
    this.setTodayClick.emit();
  }
}
