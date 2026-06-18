import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, walletOutline } from 'ionicons/icons';
import { Account } from '../../../../core/models/accounts.model';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, CurrencyPipe, DatePipe],
})
export class AccountCardComponent {
  account = input.required<Account>();
  selected = output<Account>();

  readonly maskedAccountId = computed(() => {
    const id = this.account().id;
    const normalized = id.replace(/-/g, '');
    return (normalized.slice(-4) || id.slice(-4)).toUpperCase();
  });

  constructor() {
    addIcons({
      walletOutline,
      swapHorizontalOutline,
    });
  }

  handleSelect(): void {
    this.selected.emit(this.account());
  }
}
