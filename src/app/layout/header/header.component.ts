import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';

export type HeaderSummaryBadgeVariant = 'default' | 'income' | 'expense' | 'fill';

export interface HeaderSummaryBadge {
  label: string;
  variant?: HeaderSummaryBadgeVariant;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonToolbar,
    IonHeader,
  ],
})
export class HeaderComponent {
  public readonly summary = input<string | null>(null);
  public readonly summaryBadges = input<HeaderSummaryBadge[]>([]);
}
