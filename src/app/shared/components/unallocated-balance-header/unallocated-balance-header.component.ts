import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-unallocated-balance-header',
  templateUrl: './unallocated-balance-header.component.html',
  styleUrls: ['./unallocated-balance-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, CurrencyPipe]
})
export class UnallocatedBalanceHeaderComponent {

  totalUnallocated = input.required<number>();
}
